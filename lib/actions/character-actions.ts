'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function uploadCharacterAvatar(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'Không tìm thấy file để tải lên.' }
    }

    const supabase = await createClient()

    // Tạo tên file độc nhất để tránh bị ghi đè trùng tên
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload lên bucket tên là 'avatars'
    let { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error && (error.message.includes('Bucket not found') || error.message.includes('not found'))) {
      // Tự động thử tạo bucket 'avatars' ở chế độ Public
      const { error: createError } = await supabase.storage.createBucket('avatars', { public: true })
      if (!createError) {
        const retry = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        data = retry.data
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

    // Lấy link public của file vừa tải lên
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return { success: true, url: publicUrlData.publicUrl }
  } catch (error: any) {
    console.error('Error uploading avatar:', error)
    return { success: false, error: error.message || 'Lỗi khi tải ảnh lên Storage.' }
  }
}

export async function getCharacters(caseId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('case_id', caseId)

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error fetching characters:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function saveCharacters(caseId: string, characters: any[]) {
  try {
    const supabase = await createClient()

    const isUuid = (str: string) => 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    // 1. Delete characters not present in the new list
    const existingIds = characters
      .map(c => c.id)
      .filter(id => id && isUuid(id))

    if (existingIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('characters')
        .delete()
        .eq('case_id', caseId)
        .not('id', 'in', `(${existingIds.join(',')})`)
      if (deleteError) throw deleteError
    } else {
      const { error: deleteError } = await supabase
        .from('characters')
        .delete()
        .eq('case_id', caseId)
      if (deleteError) throw deleteError
    }

    if (characters.length > 0) {
      const formattedCharacters = characters.map(c => {
        const item: any = {
          case_id: caseId,
          name: c.name,
          role: c.role || 'SUSPECT',
          avatar_url: c.avatar_url || c.avatar || '',
          position_x: c.position_x ?? 0,
          position_y: c.position_y ?? 0,
          real_motive: c.real_motive || c.motive || '',
          real_alibi: c.real_alibi || c.alibi || '',
          red_herring_secret: c.secret || c.red_herring_secret || ''
        }
        if (c.id && isUuid(c.id)) {
          item.id = c.id
        } else {
          item.id = crypto.randomUUID()
        }
        return item
      })

      const { data: upsertedChars, error: upsertError } = await supabase
        .from('characters')
        .upsert(formattedCharacters, { onConflict: 'id' })
        .select()

      if (upsertError) throw upsertError
      
      revalidatePath(`/studio/cases/${caseId}/timeline`)
      revalidatePath(`/studio/cases/${caseId}/relationships`)
      return { success: true, data: upsertedChars }
    }

    revalidatePath(`/studio/cases/${caseId}/timeline`)
    revalidatePath(`/studio/cases/${caseId}/relationships`)
    return { success: true, data: [] }
  } catch (error: any) {
    console.error('Error saving characters:', error)
    return { success: false, error: error.message }
  }
}
