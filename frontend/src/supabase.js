import { createClient } from '@supabase/supabase-js'

// These must match the variable names in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// This check prevents the "supabaseUrl is required" error
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Witcher Error: Missing Supabase Keys! Check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)