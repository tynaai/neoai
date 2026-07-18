import { createAuthClient } from 'better-auth/react'

const apiUrl = import.meta.env.VITE_API_URL as string | undefined
const authUrl = import.meta.env.VITE_AUTH_URL as string | undefined

const resolveDevAuthBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:4111'

  const devPortMap: Record<string, string> = {
    '5173': '4111',
    '5174': '4112',
  }
  const apiPort = devPortMap[window.location.port] ?? '4111'

  return `http://localhost:${apiPort}`
}

const resolveAuthBaseUrl = () => {
  if (authUrl) return authUrl.replace(/\/$/, '')
  if (apiUrl) return apiUrl.replace(/\/api\/chat\/?$/, '').replace(/\/$/, '')

  return resolveDevAuthBaseUrl()
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
})
