import { NextResponse } from "next/server"

const supabaseUrl = "https://ekkwecomikucablccucv.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3dlY29taWt1Y2FibGNjdWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzM1MDQsImV4cCI6MjA5NzA0OTUwNH0.039hzOBUbt4oratOzgScu9Iq52kRpWeoifG8c5AoKa0"

export async function GET() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&role=eq.dev&limit=100`, {
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
