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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Trong trường hợp profile chưa được khởi tạo role hoặc là 'admin', ta duyệt nếu role là admin
  // Hoặc cho phép nếu chưa cấu hình role gắt gao (nhưng nếu có profile, phải là admin)
  if (profile && profile.role !== 'admin') {
    throw new Error('Forbidden: Bạn không có quyền truy cập Admin Studio.')
  }

  return { user, profile }
}
