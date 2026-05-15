import { apiRequest } from '@/lib/api'

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type Store = {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string
  cnpj: string
  phone: string
  status: 'pending' | 'approved' | 'rejected' | 'inactive'
  createdAt: string
  updatedAt: string
}

export type Product = {
  id: string
  storeId: string
  storeName: string
  storeSlug: string
  categoryId: string
  categoryName: string
  name: string
  slug: string
  description: string | null
  priceInCents: number
  stock: number
  imageUrl: string | null
  status: 'draft' | 'active' | 'paused' | 'inactive' | 'out_of_stock'
  createdAt: string
  updatedAt: string
}

export const catalogQueryKeys = {
  categories: ['catalog', 'categories'] as const,
  stores: ['catalog', 'stores'] as const,
  products: (filters: ProductFilters = {}) =>
    ['catalog', 'products', filters] as const,
}

type ProductFilters = {
  categoryId?: string
  storeId?: string
}

export async function listCategories() {
  return apiRequest<{ categories: Category[] }>('/categories')
}

export async function listStores() {
  return apiRequest<{ stores: Store[] }>('/stores')
}

export async function listProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams()

  if (filters.categoryId) {
    params.set('categoryId', filters.categoryId)
  }

  if (filters.storeId) {
    params.set('storeId', filters.storeId)
  }

  const query = params.toString()

  return apiRequest<{ products: Product[] }>(
    query ? `/products?${query}` : '/products',
  )
}
