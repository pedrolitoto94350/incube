import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ekkwecomikucablccucv.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase.from("profiles").select("*").eq("role", "dev")
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
