import { apiRequest } from '@/lib/api'

export type CartItemStatus = 'active' | 'saved_for_later'

export type CartItem = {
  id: string
  productId: string
  storeId: string
  storeName: string
  storeSlug: string
  categoryId: string
  categoryName: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  quantity: number
  status: CartItemStatus
  unitPriceInCents: number
  subtotalInCents: number
  stock: number
  available: boolean
  createdAt: string
  updatedAt: string
}

export type Cart = {
  items: CartItem[]
  savedItems: CartItem[]
  summary: {
    itemsCount: number
    subtotalInCents: number
    shippingInCents: number
    discountInCents: number
    totalInCents: number
    couponCode: string | null
  }
}

export const cartQueryKeys = {
  all: ['cart'] as const,
  detail: (couponCode?: string) =>
    ['cart', { couponCode: couponCode?.trim() ?? '' }] as const,
}

export async function getCart(couponCode?: string) {
  const params = new URLSearchParams()

  if (couponCode?.trim()) {
    params.set('couponCode', couponCode.trim())
  }

  const query = params.toString()

  return apiRequest<Cart>(query ? `/cart?${query}` : '/cart')
}

export async function addCartItem(input: {
  productId: string
  quantity?: number
}) {
  return apiRequest<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateCartItem(input: {
  cartItemId: string
  quantity: number
}) {
  return apiRequest<Cart>(`/cart/items/${input.cartItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity: input.quantity }),
  })
}

export async function removeCartItem(cartItemId: string) {
  return apiRequest<Cart>(`/cart/items/${cartItemId}`, {
    method: 'DELETE',
  })
}

export async function saveCartItemForLater(cartItemId: string) {
  return apiRequest<Cart>(`/cart/items/${cartItemId}/save-for-later`, {
    method: 'PATCH',
  })
}

export async function moveCartItemToCart(cartItemId: string) {
  return apiRequest<Cart>(`/cart/items/${cartItemId}/move-to-cart`, {
    method: 'PATCH',
  })
}

export async function clearCart() {
  return apiRequest<Cart>('/cart', {
    method: 'DELETE',
  })
}
