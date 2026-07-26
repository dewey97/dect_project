'use server'

import { createClient } from '@/utils/supabase/server'
import { DbFeedback } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(payload: Partial<DbFeedback>) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('feedbacks')
      .insert([{
        ...payload,
        status: 'NEW'
      }])

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    return { success: false, error: error.message }
  }
}

export async function getFeedbacks(statusFilter?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('feedbacks').select('*').order('created_at', { ascending: false })
    
    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data: data as DbFeedback[] }
  } catch (error: any) {
    console.error('Error fetching feedbacks:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function updateFeedbackStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    const payload: any = { status }
    if (status === 'RESOLVED') {
      payload.resolved_at = new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('feedbacks')
      .update(payload)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/studio/feedbacks')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating feedback:', error)
    return { success: false, error: error.message }
  }
}

export async function getUnreadFeedbackCount() {
  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'NEW')

    if (error) throw error
    return { success: true, count: count || 0 }
  } catch (error: any) {
    console.error('Error fetching unread feedback count:', error)
    return { success: false, count: 0 }
  }
}
