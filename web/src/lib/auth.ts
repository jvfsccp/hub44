import {
  ApiError,
  apiRequest,
  clearAccessToken,
  setAccessToken,
} from '@/lib/api'

export type UserRole = 'customer' | 'seller' | 'admin'

export type PublicUser = {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRole
}

export type AuthUser = {
  sub: string
  name: string
  email: string
  phone: string | null
  role: UserRole
}

type LoginResponse = {
  accessToken: string
  user: PublicUser
}

type RefreshResponse = {
  accessToken: string
  user: AuthUser
}

export async function register(input: {
  name: string
  email: string
  phone: string
  password: string
  role?: Extract<UserRole, 'customer' | 'seller'>
}) {
  return apiRequest<{ user: PublicUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function login(input: { email: string; password: string }) {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  setAccessToken(response.accessToken)

  return response
}

export async function getCurrentUser() {
  return apiRequest<{ user: AuthUser }>('/auth/me')
}

export async function getCurrentUserWithRefresh() {
  try {
    return await getCurrentUser()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const response = await refreshSession()

      return { user: response.user }
    }

    throw error
  }
}

export async function refreshSession() {
  const response = await apiRequest<RefreshResponse>('/auth/refresh', {
    method: 'POST',
  })

  setAccessToken(response.accessToken)

  return response
}

export async function logout() {
  try {
    await apiRequest<{ message: string }>('/auth/logout', { method: 'POST' })
  } finally {
    clearAccessToken()
  }
}
