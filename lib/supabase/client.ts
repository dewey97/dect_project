import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zalyxhmwwmfyexoilejp.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4DpTkT6yHYAPQjtkYFfObg_u1bGZrn6'
  return createBrowserClient(url, key)
}
