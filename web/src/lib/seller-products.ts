import { apiRequest } from '@/lib/api'

export { parsePriceToCents } from '@/lib/seller-product-utils'

export type SellerProductStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'inactive'
  | 'out_of_stock'

export type SellerProduct = {
  id: string
  storeId: string
  categoryId: string
  name: string
  slug: string
  description: string | null
  priceInCents: number
  stock: number
  imageUrl: string | null
  imageUrls: string[]
  status: SellerProductStatus
  createdAt: string
  updatedAt: string
}

export type CreateSellerProductInput = {
  categoryId: string
  name: string
  slug?: string
  description?: string | null
  priceInCents: number
  stock?: number
  status?: SellerProductStatus
}

export type UpdateSellerProductInput = Partial<CreateSellerProductInput>

export const sellerProductQueryKeys = {
  all: ['seller', 'products'] as const,
}

export async function listSellerProducts() {
  return apiRequest<{ products: SellerProduct[] }>('/seller/products')
}

export async function createSellerProduct(input: CreateSellerProductInput) {
  return apiRequest<{ product: SellerProduct }>('/seller/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateSellerProduct(input: {
  productId: string
  data: UpdateSellerProductInput
}) {
  return apiRequest<{ product: SellerProduct }>(
    `/seller/products/${input.productId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input.data),
    },
  )
}

export async function updateSellerProductStatus(input: {
  productId: string
  status: SellerProductStatus
}) {
  return apiRequest<{ product: SellerProduct }>(
    `/seller/products/${input.productId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: input.status }),
    },
  )
}

export async function uploadSellerProductImage(input: {
  productId: string
  image: File
}) {
  const formData = new FormData()

  formData.set('image', input.image)

  return apiRequest<{ product: SellerProduct }>(
    `/seller/products/${input.productId}/image`,
    {
      method: 'POST',
      body: formData,
    },
  )
}
