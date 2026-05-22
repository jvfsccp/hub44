import { apiRequest } from '@/lib/api'
import type { PaymentDetails, PaymentMethod } from '@/lib/payments'

export type { PaymentDetails, PaymentMethod } from '@/lib/payments'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'canceled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type OrderItem = {
  id: string
  productId: string | null
  productName: string
  productImageUrl: string | null
  quantity: number
  unitPriceInCents: number
  subtotalInCents: number
  createdAt: string
  updatedAt: string
}

export type OrderEvent = {
  id: string
  status: OrderStatus
  message: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export type Order = {
  id: string
  customerId: string
  storeId: string
  addressId: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  deliveryMethod: string
  trackingCode: string | null
  subtotalInCents: number
  shippingInCents: number
  discountInCents: number
  totalInCents: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  events: OrderEvent[]
}

export const orderQueryKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => ['orders', orderId] as const,
  seller: ['seller', 'orders'] as const,
}

export async function listOrders() {
  return apiRequest<{ orders: Order[] }>('/orders')
}

export async function getOrder(orderId: string) {
  return apiRequest<{ order: Order }>(`/orders/${orderId}`)
}

export async function createOrderFromCart(input: {
  addressId?: string | null
  paymentMethod: PaymentMethod
  paymentDetails?: PaymentDetails
  deliveryMethod?: string
  couponCode?: string | null
}) {
  return apiRequest<{ orders: Order[] }>('/orders/from-cart', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function listSellerOrders() {
  return apiRequest<{ orders: Order[] }>('/seller/orders')
}

export async function updateSellerOrderStatus(input: {
  orderId: string
  status: OrderStatus
  trackingCode?: string | null
}) {
  return apiRequest<{ order: Order }>(
    `/seller/orders/${input.orderId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status: input.status,
        trackingCode: input.trackingCode,
      }),
    },
  )
}
