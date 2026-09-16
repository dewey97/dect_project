'use server'

import { createClient } from '@/lib/supabase/server'
import { DbProfile } from '@/lib/types/database'

export async function getPlayers() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        play_sessions (count)
      `)
      .eq('role', 'player')

    if (error) throw error
    return { success: true, data: data }
  } catch (error: any) {
    console.error('Error fetching players:', error)
    return { success: false, error: error.message, data: [] }
  }
}
