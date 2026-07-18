import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'

import { authClient } from '~/auth/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}

export function UserMenu() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-muted" aria-hidden />
  }

  if (!session?.user) {
    return (
      <Button className="h-9 rounded-full px-4" onClick={() => navigate('/login')}>
        Đăng nhập
      </Button>
    )
  }

  const { user } = session

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await Promise.race([authClient.signOut(), new Promise((resolve) => window.setTimeout(resolve, 2500))])
    } catch {
      // Still leave the protected app even if the network request fails.
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Tài khoản"
          className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-muted sm:pr-2.5"
        >
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-brand-primary-soft font-heading text-primary">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-medium md:inline">{user.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isSigningOut} onSelect={handleSignOut}>
          <LogOut />
          {isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
