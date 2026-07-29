'use server'

import { createClient } from '@/utils/supabase/server'
import { DbTimelineEvent } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function getTimelineEvents(caseId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('case_id', caseId)
      .order('start_min', { ascending: true })

    if (error) throw error
    return { success: true, data: data as DbTimelineEvent[] }
  } catch (error: any) {
    console.error('Error fetching timeline events:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function saveTimelineEvents(caseId: string, events: any[]) {
  try {
    const supabase = await createClient()

    const isUuid = (str: string) => 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    const formattedEvents = events.map(e => ({
      id: isUuid(e.id) ? e.id : crypto.randomUUID(),
      case_id: caseId,
      character_name: e.character_name,
      event_title: e.event_title,
      location: e.location || null,
      start_min: e.start_min,
      end_min: e.end_min,
      is_truth: e.is_truth ?? true,
      is_fatal: e.is_fatal ?? false
    }))

    const eventIds = formattedEvents.map(e => e.id)

    if (eventIds.length > 0) {
      await supabase.from('timeline_events').delete().eq('case_id', caseId).not('id', 'in', `(${eventIds.join(',')})`)
      const { error } = await supabase.from('timeline_events').upsert(formattedEvents, { onConflict: 'id' })
      if (error) throw error
    } else {
      await supabase.from('timeline_events').delete().eq('case_id', caseId)
    }

    revalidatePath(`/studio/cases/${caseId}/timeline`)
    return { success: true }
  } catch (error: any) {
    console.error('Error saving timeline events:', error)
    return { success: false, error: error.message }
  }
}
