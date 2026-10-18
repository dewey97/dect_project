'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login, signup, loginWithGoogle } from './actions'

interface AuthFormProps {
  initialMessage?: string
  redirectUrl?: string
  initialMode?: 'login' | 'register'
}

export function AuthForm({ initialMessage, redirectUrl, initialMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [clientError, setClientError] = useState<string | null>(null)

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      e.preventDefault()
      setClientError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.')
      return
    }
    setClientError(null)
  }

  return (
    <div className="flex-1 flex flex-col w-full px-4 sm:max-w-md justify-center gap-2 mx-auto pt-16 pb-12">
      <Card className="w-full">
        {/* Tab switcher: Đăng nhập / Đăng ký */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setClientError(null)
            }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setClientError(null)
            }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        <CardHeader className="pb-4">
          <CardTitle>
            {mode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Nhập email và mật khẩu của bạn để tiếp tục'
              : 'Tạo tài khoản mới để lưu tiến trình điều tra'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {mode === 'login' ? (
            /* FORM ĐĂNG NHẬP */
            <form action={login} className="flex flex-col gap-3">
              {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
              <div>
                <label className="text-sm font-medium" htmlFor="login-email">
                  Email
                </label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="login-password">
                  Mật khẩu
                </label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors"
              >
                Đăng Nhập
              </button>
            </form>
          ) : (
            /* FORM ĐĂNG KÝ */
            <form action={signup} onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
              {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
              <div>
                <label className="text-sm font-medium" htmlFor="register-email">
                  Email
                </label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="register-password">
                  Mật khẩu
                </label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="register-confirm-password">
                  Xác nhận mật khẩu
                </label>
                <Input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors"
              >
                Tạo Tài Khoản
              </button>
            </form>
          )}

          {/* Phân cách HOẶC */}
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">Hoặc</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>

          {/* Form Google ĐỘC LẬP - Không bị ràng buộc bởi validation ô email/password */}
          <form action={loginWithGoogle}>
            {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
            <button
              type="submit"
              className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Tiếp tục với Google
            </button>
          </form>

          {/* Lỗi client hoặc thông báo từ server */}
          {(clientError || initialMessage) && (
            <p className="p-3 bg-red-100 text-red-900 border border-red-200 rounded-md text-center text-sm">
              {clientError || initialMessage}
            </p>
          )}

          {/* Footer chuyển đổi nhanh */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            {mode === 'login' ? (
              <p>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setClientError(null)
                  }}
                  className="text-primary underline hover:text-primary/80 font-medium"
                >
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setClientError(null)
                  }}
                  className="text-primary underline hover:text-primary/80 font-medium"
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
