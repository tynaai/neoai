import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { CheckCircle2Icon, LogInIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Spinner } from '~/components/ui/spinner'
import { AuthShell } from './auth-shell'
import { authClient } from './auth-client'
import { getAuthErrorMessage } from './auth-errors'
import { authStyles } from './auth-styles'
import {
  getFirstValidationError,
  validateEmail,
  validatePassword,
} from './auth-validation'

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const validationError = getFirstValidationError(
      validateEmail(email),
      validatePassword(password),
    )

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    })

    setIsSubmitting(false)

    if (signInError) {
      setError(getAuthErrorMessage(signInError))
      return
    }

    setSuccess('Đăng nhập thành công. Đang chuyển hướng...')
    window.setTimeout(() => navigate(from, { replace: true }), 650)
  }

  return (
    <AuthShell title="Đăng nhập">
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
          <label className={authStyles.label}>
            Mật khẩu
            <Input
              className={authStyles.input}
              autoComplete="current-password"
              name="password"
              placeholder="Nhập mật khẩu"
              type="password"
            />
          </label>
          <Link className={authStyles.mutedLink} to="/forgot-password">
            Quên mật khẩu?
          </Link>
          {error && (
            <p className={authStyles.dangerText} role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className={authStyles.successText} role="status">
              <CheckCircle2Icon className="size-4" />
              {success}
            </p>
          )}
        </div>
        <Button
          className={authStyles.button}
          disabled={isSubmitting || Boolean(success)}
          type="submit"
        >
          {isSubmitting ? <Spinner /> : <LogInIcon />}
          Đăng nhập
        </Button>
      </form>
      <p className="mt-7 animate-in fade-in slide-in-from-bottom-1 text-center text-sm text-[#4B5563] duration-700">
        Chưa có tài khoản?{' '}
        <Link className={authStyles.link} to="/register">
          Tạo tài khoản
        </Link>
      </p>
    </AuthShell>
  )
}
