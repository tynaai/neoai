import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogOutIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'
import { authClient } from './auth-client'

export function LogoutButton() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)

    try {
      await Promise.race([
        authClient.signOut(),
        new Promise((resolve) => window.setTimeout(resolve, 2500)),
      ])
    } catch {
      // Still leave the protected app even if the network request fails.
    } finally {
      navigate('/login', { replace: true })
      window.setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
      }, 100)
    }
  }

  return (
    <Button
      aria-label="Đăng xuất"
      className="h-9 rounded-full border-[#D8DEE8] bg-white px-2.5 text-[#4B5563] shadow-none transition-all duration-200 hover:border-[#0B63CE]/30 hover:bg-[#EAF3FF] hover:text-[#0B63CE] sm:px-3"
      disabled={isSigningOut}
      onClick={handleSignOut}
      type="button"
      variant="outline"
    >
      {isSigningOut ? <Spinner /> : <LogOutIcon aria-hidden />}
      <span className="hidden sm:inline">Đăng xuất</span>
      <span className="sr-only sm:hidden">Đăng xuất</span>
    </Button>
  )
}
