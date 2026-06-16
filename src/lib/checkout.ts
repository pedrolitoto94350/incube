import { stripePromise } from "./stripe-client"

export async function createSetupIntent(): Promise<string> {
  const res = await fetch("/api/stripe/setup-intent", { method: "POST" })
  const data = await res.json()
  return data.clientSecret
}

export async function chargeCommission(matchId: string): Promise<boolean> {
  const res = await fetch("/api/stripe/charge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId }),
  })
  const data = await res.json()
  return data.success
}
