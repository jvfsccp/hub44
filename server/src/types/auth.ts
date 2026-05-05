import type { UserRole } from '@/repositories/users-repository'

export type AuthTokenPayload = {
  sub: string
  name: string
  email: string
  phone: string | null
  role: UserRole
}
