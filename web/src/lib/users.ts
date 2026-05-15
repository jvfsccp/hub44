import { apiRequest } from '@/lib/api'
import type { UserRole } from '@/lib/auth'

export type UserProfile = {
  id: string
  name: string
  email: string
  phone: string | null
  cpf: string | null
  role: UserRole
  emailNotifications: boolean
  newsletter: boolean
  promotions: boolean
  createdAt: string
  updatedAt: string
}

export type UpdateUserProfileInput = Partial<{
  name: string
  email: string
  phone: string | null
  cpf: string | null
  emailNotifications: boolean
  newsletter: boolean
  promotions: boolean
}>

export const userQueryKeys = {
  profile: ['users', 'me'] as const,
}

export async function getUserProfile() {
  return apiRequest<{ user: UserProfile }>('/users/me')
}

export async function updateUserProfile(input: UpdateUserProfileInput) {
  return apiRequest<{ user: UserProfile }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function updateUserPassword(input: {
  currentPassword: string
  newPassword: string
}) {
  return apiRequest<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
