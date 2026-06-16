import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.text()
  console.log("Webhook received:", body.substring(0, 100))
  return NextResponse.json({ received: true })
}
