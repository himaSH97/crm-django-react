import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'

export function RequireAuth() {
  const { status } = useAuth()

  if (status === 'loading') return <SessionCheck />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireGuest() {
  const { status } = useAuth()

  if (status === 'loading') return <SessionCheck />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}

function SessionCheck() {
  return (
    <main className="grid min-h-svh place-items-center bg-background text-sm text-muted-foreground">
      Checking session…
    </main>
  )
}