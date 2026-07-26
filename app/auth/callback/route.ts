import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Nếu có param "next", ta sẽ redirect về đó, mặc định là trang chủ '/'
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    // Hàm này sẽ đổi mã code lấy phiên đăng nhập và ĐỒNG THỜI xác nhận email thành công
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Trả về trang đăng nhập kèm lỗi nếu xác nhận thất bại
  return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Không thể xác nhận email. Link có thể đã hết hạn.')}`)
}
