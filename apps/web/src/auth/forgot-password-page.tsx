import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router'
import { CheckCircle2Icon, MailIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Spinner } from '~/components/ui/spinner'
import { cn } from '~/lib/utils'
import { AuthShell } from './auth-shell'
import { authClient } from './auth-client'
import { getAuthErrorMessage } from './auth-errors'
import { authStyles } from './auth-styles'
import { validateEmail } from './auth-validation'

type PasswordResetClient = typeof authClient & {
  forgetPassword?: (input: {
    email: string
    redirectTo?: string
  }) => Promise<{ error?: Parameters<typeof getAuthErrorMessage>[0] }>
}

export function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSent(false)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const validationError = validateEmail(email)

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    const client = authClient as PasswordResetClient

    if (!client.forgetPassword) {
      setIsSubmitting(false)
      setError('Tính năng đặt lại mật khẩu chưa được bật.')
      return
    }

    const { error: resetError } = await client.forgetPassword({
      email,
      redirectTo: `${window.location.origin}/login`,
    })

    setIsSubmitting(false)

    if (resetError) {
      setError(getAuthErrorMessage(resetError))
      return
    }

    setSent(true)
  }

  return (
    <AuthShell title="Đặt lại mật khẩu">
      <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <label className={authStyles.label}>
            Email
            <Input
              className={authStyles.input}
              autoComplete="email"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          </label>
          {error && (
            <p className={authStyles.dangerText} role="alert">
              {error}
            </p>
          )}
          {sent && (
            <p className={authStyles.successText} role="status">
              <CheckCircle2Icon className="size-4" />
              Nếu tài khoản hợp lệ, liên kết đặt lại mật khẩu đã được gửi.
            </p>
          )}
        </div>
        <Button
          className={authStyles.button}
          disabled={isSubmitting || sent}
          type="submit"
        >
          {isSubmitting ? <Spinner /> : <MailIcon />}
          Gửi liên kết đặt lại
        </Button>
      </form>
      <p className={cn('mt-7 animate-in fade-in slide-in-from-bottom-1 duration-700', authStyles.secondaryText)}>
        Đã nhớ mật khẩu?{' '}
        <Link className={authStyles.link} to="/login">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  )
}
