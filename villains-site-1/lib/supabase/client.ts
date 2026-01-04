import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oxhllxkvklxkxvdtpebd.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_X3qkbag4sU8Pna_7wzFmzA_Mj8Zj0Rr'
  )
}
