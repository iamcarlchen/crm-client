const AUTH_KEY = 'crm.auth'

export type AuthState = {
  token: string
  user?: {
    username?: string
    role?: string
  }
  loggedInAt: string
}

const AUTH_EVENT = 'crm:auth-changed'

function emitAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function subscribeAuthChanged(listener: () => void) {
  window.addEventListener(AUTH_EVENT, listener)
  // Also listen to cross-tab changes.
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(AUTH_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthState
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return getAuth()?.token ?? null
}

export function isAuthed(): boolean {
  return !!getToken()
}

export function setAuth(state: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state))
  emitAuthChanged()
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
  emitAuthChanged()
}

export function getUserDisplayName(): string {
  const auth = getAuth()
  if (!auth?.token) return '-'

  if (auth.user?.username) return auth.user.username

  const payload = decodeJwt<{ username?: string; user?: string; email?: string }>(auth.token)
  return payload?.username ?? payload?.user ?? payload?.email ?? '-'
}

export function isAdmin(): boolean {
  const auth = getAuth()
  if (!auth?.token) return false

  const payload = decodeJwt<{ role?: string; roles?: string[] }>(auth.token)
  const role = auth.user?.role ?? payload?.role ?? payload?.roles?.[0]

  if (!role) return false
  return String(role).toLowerCase().includes('admin')
}

export function decodeJwt<T = unknown>(token: string): T | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]

    // base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = atob(padded)
    return JSON.parse(json) as T
  } catch {
    return null
  }
}
