'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { DbAppSettings } from '@/lib/types/database'

/** Lấy cấu hình toàn cục */
export async function getAppSettings() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Không tìm thấy dữ liệu, khởi tạo row mặc định
        const defaultSettings = { id: 1, maintenance_mode: false, banner_active: true, banner_text: '🚀 Chào mừng đến với Dect Project - Studio đang trong giai đoạn Alpha Test!' }
        await supabase.from('app_settings').insert([defaultSettings])
        return { success: true, data: defaultSettings as DbAppSettings }
      }
      throw error
    }
    
    return { success: true, data: data as DbAppSettings }
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return { success: false, error: error.message }
  }
}

/** Cập nhật cấu hình toàn cục */
export async function updateAppSettings(payload: Partial<DbAppSettings>) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('app_settings')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    if (error) throw error
    
    // Cập nhật lại toàn bộ ứng dụng vì settings ảnh hưởng mọi nơi
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return { success: false, error: error.message }
  }
}
