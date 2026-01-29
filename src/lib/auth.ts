const AUTH_KEY = 'crm.auth'

export type AuthState = {
  user: string
  loggedInAt: string
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

export function isAuthed(): boolean {
  return !!getAuth()
}

export function login(user: string) {
  const state: AuthState = {
    user,
    loggedInAt: new Date().toISOString(),
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(state))
}

export function logout() {
  localStorage.removeItem(AUTH_KEY)
}
