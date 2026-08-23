'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRelationships(caseId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('case_id', caseId)

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error fetching relationships:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function saveRelationships(caseId: string, relationships: any[]) {
  try {
    const supabase = await createClient()

    const isUuid = (str: string) => 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    const formatted = relationships.map(r => ({
      id: r.id && isUuid(r.id) ? r.id : crypto.randomUUID(),
      case_id: caseId,
      character_1_id: r.character_1_id,
      character_2_id: r.character_2_id,
      relation_type: r.relation_type || 'Giao thiệp',
      affinity_score: r.affinity_score ?? 0
    }))

    const relIds = formatted.map(r => r.id)

    if (relIds.length > 0) {
      await supabase.from('relationships').delete().eq('case_id', caseId).not('id', 'in', `(${relIds.join(',')})`)
      const { error: insertError } = await supabase.from('relationships').upsert(formatted, { onConflict: 'id' })
      if (insertError) throw insertError
    } else {
      await supabase.from('relationships').delete().eq('case_id', caseId)
    }

    revalidatePath(`/studio/cases/${caseId}/relationships`)
    return { success: true }
  } catch (error: any) {
    console.error('Error saving relationships:', error)
    return { success: false, error: error.message }
  }
}
