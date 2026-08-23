'use server'

import { createClient } from '@/lib/supabase/server'
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

    const isUuid = (str: string) => 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    const formattedLocations = locations.map(loc => ({
      id: isUuid(loc.id) ? loc.id : crypto.randomUUID(),
      case_id: caseId,
      title: loc.title,
      type: loc.type,
      details: loc.details || null,
      position_x: loc.x,
      position_y: loc.y
    }))

    const locationIds = formattedLocations.map(l => l.id)

    if (locationIds.length > 0) {
      await supabase.from('locations').delete().eq('case_id', caseId).not('id', 'in', `(${locationIds.join(',')})`)
      const { error } = await supabase.from('locations').upsert(formattedLocations, { onConflict: 'id' })
      if (error) throw error
    } else {
      await supabase.from('locations').delete().eq('case_id', caseId)
    }

    revalidatePath(`/studio/cases/${caseId}/locations`)
    return { success: true }
  } catch (error: any) {
    console.error('Error saving locations:', error)
    return { success: false, error: error.message }
  }
}
