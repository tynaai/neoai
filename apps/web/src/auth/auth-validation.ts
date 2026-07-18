const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string) {
  if (!email.trim()) return 'Vui lòng nhập email.'
  if (!emailPattern.test(email)) return 'Email không đúng định dạng.'

  return ''
}

export function validatePassword(password: string) {
  if (!password) return 'Vui lòng nhập mật khẩu.'
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.'

  return ''
}

export function validateName(name: string) {
  if (!name.trim()) return 'Vui lòng nhập họ tên.'
  if (name.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự.'

  return ''
}

export function getFirstValidationError(...errors: string[]) {
  return errors.find(Boolean) ?? ''
}
