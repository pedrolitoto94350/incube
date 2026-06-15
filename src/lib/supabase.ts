import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekkwecomikucablccucv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVra3dlY29taWt1Y2FibGNjdWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzM1MDQsImV4cCI6MjA5NzA0OTUwNH0.039hzOBUbt4oratOzgScu9Iq52kRpWeoifG8c5AoKa0'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
