import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ekkwecomikucablccucv.supabase.co"

export async function GET() {
  // Try with both keys
  const keys = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ].filter(Boolean) as string[]

  for (const key of keys) {
    try {
      const supabase = createClient(supabaseUrl, key)
      const { data } = await supabase.from("profiles").select("id,full_name,dev_number,skills,bio,daily_rate,availability,english_level,role").eq("role", "dev")
      if (data && data.length > 0) {
        return NextResponse.json(data)
      }
    } catch {}
  }

  // Fallback: direct REST call
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,full_name,skills,role&role=eq.dev`, {
      headers: {
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
      },
    })
    const data = await res.json()
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
