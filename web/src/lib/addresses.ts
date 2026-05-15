import { apiRequest } from '@/lib/api'

export type Address = {
  id: string
  userId: string | null
  storeId: string | null
  recipient: string | null
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  zipCode: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export type AddressInput = {
  recipient?: string | null
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
  isPrimary?: boolean
}

export const addressQueryKeys = {
  all: ['addresses'] as const,
}

export async function listAddresses() {
  return apiRequest<{ addresses: Address[] }>('/addresses')
}

export async function createAddress(input: AddressInput) {
  return apiRequest<{ address: Address }>('/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateAddress(
  input: Partial<AddressInput> & { id: string },
) {
  const { id, ...body } = input

  return apiRequest<{ address: Address }>(`/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function setPrimaryAddress(addressId: string) {
  return apiRequest<{ address: Address }>(`/addresses/${addressId}/primary`, {
    method: 'PATCH',
  })
}
