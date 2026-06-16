import { NextResponse } from "next/server"
import { createClient } from "../../../../lib/supabase"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "REMOVED"

export async function POST(req: Request) {
  try {
    const { matchId } = await req.json()
    if (!matchId) return NextResponse.json({ success: false, error: "Missing matchId" }, { status: 400 })

    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-05-27.dahlia" })
    const supabase = createClient()
    
    // Get the match
    const { data: match } = await supabase.from("matches").select("*").eq("id", matchId).single()
    if (!match) return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 })
    if (match.status !== "proposed") return NextResponse.json({ success: false, error: "Match not in proposed state" }, { status: 400 })

    // Get employer profile for payment method
    const { data: employerProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", match.employer_id)
      .single()

    if (!employerProfile?.stripe_customer_id || !employerProfile?.stripe_payment_method_id) {
      return NextResponse.json({ success: false, error: "Employer has no payment method on file" }, { status: 400 })
    }

    // Commission: 15% of budget, capped at 300€
    const budget = match.budget || 3000
    const commissionAmount = Math.min(Math.round(budget * 0.15 * 100), 30000) // in cents

    // Charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: commissionAmount,
      currency: "eur",
      customer: employerProfile.stripe_customer_id,
      payment_method: employerProfile.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `Commission InCube - ${match.title || "Mission"}`,
    })

    // Update match as matched + paid
    await supabase
      .from("matches")
      .update({
        status: "matched",
        commission_amount: commissionAmount / 100,
        commission_paid: true,
      })
      .eq("id", matchId)

    return NextResponse.json({ success: true, amount: commissionAmount / 100 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
