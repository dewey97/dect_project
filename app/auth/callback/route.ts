import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Xác định domain thực tế
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || requestUrl.host
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : `${proto}://${host}`

  // Đảm bảo redirect URL an toàn (chỉ cho phép đường dẫn nội bộ)
  const safeNext = next.startsWith('/') ? next : '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Khởi tạo profile mặc định nếu chưa tồn tại
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Thám tử',
        role: 'player'
      }, { onConflict: 'id', ignoreDuplicates: true })

      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // Trả về trang đăng nhập kèm thông báo nếu đổi mã thất bại
  return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Không thể xác thực phiên đăng nhập. Link có thể đã hết hạn hoặc không hợp lệ.')}`)
}
