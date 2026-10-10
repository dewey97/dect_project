'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/** Lấy domain public của ứng dụng một cách an toàn cho mọi môi trường (VPS / Custom domain / Localhost) */
async function getAppOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') || 'https'
  return `${proto}://${host}`
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const redirectTo = (formData.get('redirect') as string) || '/'

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const errUrl = redirectTo !== '/' ? `/login?redirect=${encodeURIComponent(redirectTo)}&message=` : '/login?message='
    redirect(errUrl + encodeURIComponent(error.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.'))
  }

  // Khởi tạo profile mặc định nếu chưa có
  if (authData?.user) {
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      display_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Thám tử',
      role: 'player'
    }, { onConflict: 'id', ignoreDuplicates: true })
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || '/'

  const origin = await getAppOrigin()
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  })

  if (error) {
    const errUrl = redirectTo !== '/' ? `/login?redirect=${encodeURIComponent(redirectTo)}&message=` : '/login?message='
    redirect(errUrl + encodeURIComponent(error.message || 'Không thể tạo tài khoản.'))
  }

  // Khởi tạo profile mặc định nếu tài khoản được tạo thành công
  if (authData?.user) {
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      display_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Thám tử',
      role: 'player'
    }, { onConflict: 'id', ignoreDuplicates: true })
  }

  revalidatePath('/', 'layout')

  // Nếu Supabase bật Auto-Confirm (đã có session đăng nhập ngay)
  if (authData?.session) {
    redirect(redirectTo)
  }

  // Nếu Supabase yêu cầu xác nhận email qua hộp thư
  redirect('/login?message=' + encodeURIComponent('Đăng ký thành công! Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản.'))
}

export async function loginWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const redirectTo = (formData.get('redirect') as string) || '/'
  const origin = await getAppOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  })

  if (error) {
    redirect('/login?message=' + encodeURIComponent(error.message || 'Không thể đăng nhập bằng Google.'))
  }

  if (data?.url) {
    redirect(data.url)
  }
}
