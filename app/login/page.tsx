import { AuthForm } from './auth-form'

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string; redirect?: string; mode?: 'login' | 'register' }>
}) {
  const searchParams = await props.searchParams
  const message = searchParams.message
  const redirectUrl = searchParams.redirect
  const mode = searchParams.mode === 'register' ? 'register' : 'login'

  return (
    <AuthForm
      initialMessage={message}
      redirectUrl={redirectUrl}
      initialMode={mode}
    />
  )
}
