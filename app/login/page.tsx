import { login, signup } from './actions'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  const searchParams = await props.searchParams
  const message = searchParams.message

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto pt-20">
      <Card>
        <CardHeader>
          <CardTitle>Đăng nhập hệ thống</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để truy cập hoặc tạo tài khoản mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex-1 flex flex-col w-full justify-center gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              name="email"
              placeholder="ban@example.com"
              required
            />
            <label className="text-sm font-medium mt-4" htmlFor="password">
              Mật khẩu
            </label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
            <div className="flex flex-col gap-2 mt-6">
              <button 
                type="submit" 
                formAction={login}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 transition-colors"
              >
                Đăng Nhập
              </button>
              <button 
                type="submit" 
                formAction={signup}
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 transition-colors"
              >
                Đăng Ký
              </button>
            </div>
            {message && (
              <p className="mt-4 p-3 bg-red-100 text-red-900 border border-red-200 rounded-md text-center text-sm">
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
