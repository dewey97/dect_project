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

/** Lấy chi tiết 1 Vụ án (Cho màn Overview) */
export async function getCaseOverview(caseId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (error) throw error
    return { success: true, data: data as DbCase }
  } catch (error: any) {
    console.error('Error fetching case overview:', error)
    return { success: false, error: error.message }
  }
}

/** Upload ảnh bìa Vụ án lên Storage */
export async function uploadCaseCover(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'Không tìm thấy file để tải lên.' }
    }

    const supabase = await createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `covers/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

    let { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error && (error.message.includes('Bucket not found') || error.message.includes('not found'))) {
      const { error: createError } = await supabase.storage.createBucket('avatars', { public: true })
      if (!createError) {
        const retry = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })
        error = retry.error
      }
    }

    if (error) {
      if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
        return { 
          success: false, 
          error: "Chưa có Bucket 'avatars' trên Supabase. Vui lòng vào Supabase Dashboard > Storage > Create new bucket tên 'avatars' và bật Public." 
        }
      }
      throw error
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return { success: true, url: publicUrlData.publicUrl }
  } catch (error: any) {
    console.error('Error uploading cover:', error)
    return { success: false, error: error.message || 'Lỗi khi tải ảnh bìa lên Storage.' }
  }
}

/** Cập nhật thông tin Vụ án */
export async function updateCaseOverview(caseId: string, payload: Partial<DbCase>) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('cases')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', caseId)

    if (error) throw error
    
    revalidatePath(`/studio/cases/${caseId}/overview`)
    revalidatePath(`/studio/cases`)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating case:', error)
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
    
    revalidatePath(`/studio/cases`)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting case:', error)
    return { success: false, error: error.message }
  }
}

/** Nhân bản Vụ án */
export async function duplicateCase(caseId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Fetch case
    const { data: c, error } = await supabase.from('cases').select('*').eq('id', caseId).single()
    if (error) throw error
    
    // 2. Insert new case
    const { data: newCase, error: insertError } = await supabase.from('cases').insert([{
      title: `Copy of ${c.title}`,
      synopsis: c.synopsis,
      full_story: c.full_story,
      difficulty: c.difficulty,
      status: 'DRAFT',
      cover_image_url: c.cover_image_url
    }]).select().single()
    if (insertError) throw insertError

    // 3. Fetch nodes and edges
    const { data: nodes } = await supabase.from('evidence_nodes').select('*').eq('case_id', caseId)
    const { data: edges } = await supabase.from('evidence_edges').select('*').eq('case_id', caseId)
    
    if (nodes && nodes.length > 0) {
      const idMap = new Map()
      const newNodes = nodes.map(n => {
        const newId = crypto.randomUUID()
        idMap.set(n.id, newId)
        return {
          id: newId,
          case_id: newCase.id,
          type: n.type,
          position_x: n.position_x,
          position_y: n.position_y,
          label: n.label,
          description: n.description,
          category: n.category,
          logic_data: n.logic_data
        }
      })
      await supabase.from('evidence_nodes').insert(newNodes)
      
      if (edges && edges.length > 0) {
        const newEdges = edges.map(e => ({
          id: crypto.randomUUID(),
          case_id: newCase.id,
          source_node_id: idMap.get(e.source_node_id) || e.source_node_id,
          target_node_id: idMap.get(e.target_node_id) || e.target_node_id
        }))
        await supabase.from('evidence_edges').insert(newEdges)
      }
    }

    revalidatePath('/studio/cases')
    return { success: true, data: newCase }
  } catch (error: any) {
    console.error('Error duplicating case:', error)
    return { success: false, error: error.message }
  }
}
