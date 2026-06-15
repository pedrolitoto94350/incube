import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ouhvxrcexyzxbevgflof.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aHZ4cmNleHl6eGJldmdmbG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMzQxOTAsImV4cCI6MjA1MDcxMDE5MH0.wbFpfRKrzqZYPQvFz4g8JPl9KUK2L8n77ZXlV52e3n4'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
