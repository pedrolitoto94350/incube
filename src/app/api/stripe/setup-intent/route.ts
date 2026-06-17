import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" })

    let customer
    if (customerId) {
      customer = customerId
    } else {
      const newCustomer = await stripe.customers.create()
      customer = newCustomer.id
    }
    const setupIntent = await stripe.setupIntents.create({
      customer,
      payment_method_types: ["card"],
    })
    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
