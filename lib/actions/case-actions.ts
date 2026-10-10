'use server'

import { createClient } from '@/lib/supabase/server'
import { DbCase, CaseStatus } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

/** Lấy thống kê tổng quan cho Dashboard */
export async function getDashboardStats() {
  try {
    const supabase = await createClient()
    
    // Đếm tổng số players
    const { count: playersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'player')

    // Đếm tổng số vụ án
    const { count: casesCount } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })

    // Đếm tổng số phiên chơi đang diễn ra
    const { count: activeSessionsCount } = await supabase
      .from('play_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PLAYING')

    return {
      success: true,
      data: {
        totalPlayers: playersCount || 0,
        totalCases: casesCount || 0,
        activeSessions: activeSessionsCount || 0
      }
    }
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return { success: false, error: error.message }
  }
}

/** Lấy danh sách toàn bộ Vụ án (Cho trang /studio/cases) */
export async function getCases() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data: data as DbCase[] }
  } catch (error: any) {
    console.error('Error fetching cases:', error)
    return { success: false, error: error.message, data: [] }
  }
}

/** Tạo Vụ án mới (Bản nháp) */
export async function createCaseDraft(title: string = 'Untitled Mystery') {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cases')
      .insert([{ title, status: 'DRAFT' }])
      .select()
      .single()

    if (error) throw error
    revalidatePath('/studio/cases')
    return { success: true, data: data as DbCase }
  } catch (error: any) {
    console.error('Error creating case draft:', error)
    return { success: false, error: error.message }
  }
}

/** Xóa Vụ án */
export async function deleteCase(caseId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', caseId)

    if (error) throw error
    
    revalidatePath('/studio/cases')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting case:', error)
    return { success: false, error: error.message }
  }
}

/** Nhân bản Vụ án (Metadata) */
export async function duplicateCase(caseId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Fetch case gốc
    const { data: c, error } = await supabase.from('cases').select('*').eq('id', caseId).single()
    if (error) throw error
    
    // 2. Insert case mới
    const { data: newCase, error: insertError } = await supabase.from('cases').insert([{
      title: `Copy of ${c.title}`,
      synopsis: c.synopsis,
      full_story: c.full_story,
      difficulty: c.difficulty,
      status: 'DRAFT',
      cover_image_url: c.cover_image_url
    }]).select().single()
    if (insertError) throw insertError

    revalidatePath('/studio/cases')
    return { success: true, data: newCase }
  } catch (error: any) {
    console.error('Error duplicating case:', error)
    return { success: false, error: error.message }
  }
}
