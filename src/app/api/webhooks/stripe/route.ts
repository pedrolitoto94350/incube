import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe("REMOVED", {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") || ""

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
    
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("Payment succeeded:", event.data.object.id)
        break
      case "setup_intent.succeeded":
        console.log("Setup intent succeeded:", event.data.object.id)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
