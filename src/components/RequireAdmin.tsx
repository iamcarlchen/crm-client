import { useSyncExternalStore } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdmin, subscribeAuthChanged } from '../lib/auth'

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const admin = useSyncExternalStore(subscribeAuthChanged, isAdmin, isAdmin)
  if (!admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
