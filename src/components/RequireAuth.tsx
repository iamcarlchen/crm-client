import { useSyncExternalStore } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthed, subscribeAuthChanged } from '../lib/auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const authed = useSyncExternalStore(subscribeAuthChanged, isAuthed, isAuthed)

  if (!authed) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}
