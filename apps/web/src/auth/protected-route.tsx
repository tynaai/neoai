import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '~/components/ui/spinner'
import { authClient } from './auth-client'

export function ProtectedRoute() {
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <Spinner className="size-5" />
      </main>
    )
  }

  const isSignedIn = Boolean(session?.user && session?.session)

  if (!isSignedIn) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  return <Outlet />
}
