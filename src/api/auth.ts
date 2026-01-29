import { api } from './http'

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token?: string
  accessToken?: string
  access_token?: string
  user?: {
    username?: string
    role?: string
  }
}

export const authApi = {
  login: (payload: LoginRequest) => api<LoginResponse>('/auth/login', { method: 'POST', json: payload }),
}
