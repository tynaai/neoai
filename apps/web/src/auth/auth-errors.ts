type AuthError = {
  message?: string
  status?: number
  statusText?: string
  code?: string
}

const authErrorMessages: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Email chưa được xác minh.',
  INVALID_EMAIL: 'Email không đúng định dạng.',
  INVALID_EMAIL_OR_PASSWORD: 'Email hoặc mật khẩu không đúng.',
  INVALID_PASSWORD: 'Mật khẩu không đúng.',
  USER_ALREADY_EXISTS: 'Email này đã được sử dụng. Vui lòng dùng email khác.',
  USER_NOT_FOUND: 'Không tìm thấy tài khoản với email này.',
}

const authMessageTranslations: Record<string, string> = {
  'Invalid email or password': 'Email hoặc mật khẩu không đúng.',
  'Invalid password': 'Mật khẩu không đúng.',
  'User already exists. Use another email.':
    'Email này đã được sử dụng. Vui lòng dùng email khác.',
  'User not found': 'Không tìm thấy tài khoản với email này.',
}

export function getAuthErrorMessage(error: AuthError | null | undefined) {
  if (!error) return 'Đã có lỗi xảy ra. Vui lòng thử lại.'

  if (error.code && authErrorMessages[error.code]) {
    return authErrorMessages[error.code]
  }

  if (error.message && authMessageTranslations[error.message]) {
    return authMessageTranslations[error.message]
  }

  const lowerMessage = error.message?.toLowerCase() ?? ''

  if (lowerMessage.includes('user already exists')) {
    return 'Email này đã được sử dụng. Vui lòng dùng email khác.'
  }

  if (lowerMessage.includes('invalid') && lowerMessage.includes('password')) {
    return 'Email hoặc mật khẩu không đúng.'
  }

  if (lowerMessage.includes('not found')) {
    return 'Không tìm thấy tài khoản phù hợp.'
  }

  if (error.status === 429) {
    return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.'
  }

  if (error.status && error.status >= 500) {
    return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
  }

  return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
