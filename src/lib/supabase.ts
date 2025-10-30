import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  role: 'resident' | 'supervisor'
  address: string
  language: 'en' | 'ur'
  created_at: string
}

export type TrashPickup = {
  id: string
  user_id: string
  date: string
  status: 'collected' | 'pending'
  marked_at: string
}

export type Report = {
  id: string
  user_id: string
  address: string
  comment: string | null
  photo_url: string | null
  status: 'open' | 'resolved'
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
}
