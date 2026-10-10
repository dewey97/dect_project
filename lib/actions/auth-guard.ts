'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Kiểm tra xem người dùng hiện tại có authenticated và có role admin (hoặc creator) không.
 * Ném lỗi hoặc trả về false nếu không hợp lệ.
 */
export async function requireAdminAuth() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized: Bạn chưa đăng nhập.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile && profile.role !== 'admin') {
    throw new Error('Forbidden: Bạn không có quyền truy cập Admin Studio.')
  }

  return { user, profile }
}

/**
 * Server Action an toàn kiểm tra người dùng hiện tại có quyền Admin hay không.
 * Không ném lỗi, trả về boolean.
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Kiểm tra role từ app_metadata (nếu có)
    if (user.app_metadata?.role === 'super_admin' || user.app_metadata?.role === 'admin') {
      return true
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch {
    return false
  }
}

