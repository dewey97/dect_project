import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Xác định domain thực tế một cách chính xác nhất
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost || request.headers.get('host') || requestUrl.host
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const origin = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') : `${proto}://${host}`

  // Chuẩn hóa đường dẫn đích
  let safeNext = next.startsWith('/') ? next : '/'
  // Nếu redirect về /admin thì chuẩn hóa sang /studio
  if (safeNext === '/admin' || safeNext.startsWith('/admin/')) {
    safeNext = safeNext.replace(/^\/admin/, '/studio')
  }

  const redirectResponse = NextResponse.redirect(`${origin}${safeNext}`)

  if (code) {
    // Tạo client thao tác trực tiếp với response cookies để session được set ngay lập tức
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zalyxhmwwmfyexoilejp.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4DpTkT6yHYAPQjtkYFfObg_u1bGZrn6',
      {
        cookies: {
          getAll() {
            // Lấy từ request cookie header
            const cookieHeader = request.headers.get('cookie') ?? ''
            return cookieHeader.split('; ').filter(Boolean).map(c => {
              const [name, ...val] = c.split('=')
              return { name, value: val.join('=') }
            })
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Đảm bảo profile tồn tại mà không ghi đè role admin đã có
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Thám tử',
          role: data.user.app_metadata?.role === 'admin' ? 'admin' : 'player'
        })
      }

      return redirectResponse
    }
  }

  // Trả về trang đăng nhập kèm thông báo nếu đổi mã thất bại
  return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('Không thể xác thực phiên đăng nhập. Link có thể đã hết hạn hoặc không hợp lệ.')}`)
}
