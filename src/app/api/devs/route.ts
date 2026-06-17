import { NextResponse } from "next/server"

const supabaseUrl = "https://ekkwecomikucablccucv.supabase.co"

export async function GET() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&role=eq.dev`, {
    headers: {
      "apikey": anonKey || "",
      "Authorization": `Bearer ${anonKey || ""}`,
    },
  })
  const data = await response.json()
  return NextResponse.json(data)
}
