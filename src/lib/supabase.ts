// @ts-ignore
import { createClient } from '@supabase/supabase-js'

// Lazy Supabase client initialization
let supabaseClient: any = null;

export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

export const getSupabase = () => {
  if (!supabaseClient && isSupabaseConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// For backward compatibility
export const supabase = {
  get auth() {
    return getSupabase()?.auth
  },
  get from() {
    return getSupabase()?.from
  },
  get storage() {
    return getSupabase()?.storage
  }
} 