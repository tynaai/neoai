import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { CheckCircle2Icon, UserPlusIcon } from 'lucide-react'
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
  validateName,
  validatePassword,
} from './auth-validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const validationError = getFirstValidationError(
      validateName(name),
      validateEmail(email),
      validatePassword(password),
    )

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    const { error: signUpError } = await authClient.signUp.email({
      email,
      name,
      password,
    })

    setIsSubmitting(false)

    if (signUpError) {
      setError(getAuthErrorMessage(signUpError))
      return
    }

    setSuccess('Tạo tài khoản thành công. Đang chuyển đến trang đăng nhập...')
    window.setTimeout(() => navigate('/login', { replace: true }), 900)
  }

  return (
    <AuthShell title="Tạo tài khoản">
      <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
        <div className="grid gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <label className={authStyles.label}>
            Họ tên
            <Input
              className={authStyles.input}
              autoComplete="name"
              name="name"
              placeholder="Nguyễn Văn A"
              type="text"
            />
          </label>
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
              autoComplete="new-password"
              name="password"
              placeholder="Tối thiểu 8 ký tự"
              type="password"
            />
          </label>
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
          {isSubmitting ? <Spinner /> : <UserPlusIcon />}
          Tạo tài khoản
        </Button>
      </form>
      <p className="mt-7 animate-in fade-in slide-in-from-bottom-1 text-center text-sm text-[#4B5563] duration-700">
        Đã có tài khoản?{' '}
        <Link className={authStyles.link} to="/login">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  )
}
