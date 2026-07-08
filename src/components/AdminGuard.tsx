import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
