import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe("REMOVED", {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()
    let customer
    if (customerId) {
      customer = { customer: customerId }
    } else {
      // Create a new customer
      const newCustomer = await stripe.customers.create()
      customer = { customer: newCustomer.id }
    }
    const setupIntent = await stripe.setupIntents.create({
      ...customer,
      payment_method_types: ["card"],
    })
    return NextResponse.json({ clientSecret: setupIntent.client_secret })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
