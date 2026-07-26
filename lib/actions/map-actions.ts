'use server'

import { createClient } from '@/utils/supabase/server'
import { DbLocation } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function getLocations(caseId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('case_id', caseId)

    if (error) throw error
    return { success: true, data: data as DbLocation[] }
  } catch (error: any) {
    console.error('Error fetching locations:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function saveLocations(caseId: string, locations: any[]) {
  try {
    const supabase = await createClient()

    // Xóa locations cũ
    await supabase.from('locations').delete().eq('case_id', caseId)

    if (locations.length > 0) {
      const formattedLocations = locations.map(loc => ({
        id: loc.id,
        case_id: caseId,
        title: loc.title,
        type: loc.type,
        details: loc.details || null,
        position_x: loc.x,
        position_y: loc.y
      }))

      const { error } = await supabase.from('locations').insert(formattedLocations)
      if (error) throw error
    }

    revalidatePath(`/studio/cases/${caseId}/locations`)
    return { success: true }
  } catch (error: any) {
    console.error('Error saving locations:', error)
    return { success: false, error: error.message }
  }
}
