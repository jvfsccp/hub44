import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { CartItemWithProduct } from '../src/repositories/cart-repository'
import { toCartResponse } from '../src/services/cart-service'

const createdAt = new Date('2026-05-22T12:00:00Z')

test('builds cart summary with active items, shipping and coupon discount', () => {
  const response = toCartResponse(
    [
      makeRow({ id: 'active-1', quantity: 2, priceInCents: 5000 }),
      makeRow({
        id: 'saved-1',
        quantity: 1,
        priceInCents: 8000,
        status: 'saved_for_later',
      }),
    ],
    'hub44',
  )

  assert.equal(response.items.length, 1)
  assert.equal(response.savedItems.length, 1)
  assert.deepEqual(response.summary, {
    itemsCount: 2,
    subtotalInCents: 10000,
    shippingInCents: 2490,
    discountInCents: 1000,
    totalInCents: 11490,
    couponCode: 'HUB44',
  })
})

test('does not charge shipping when cart has no active items', () => {
  const response = toCartResponse([
    makeRow({
      id: 'saved-1',
      quantity: 1,
      status: 'saved_for_later',
    }),
  ])

  assert.equal(response.summary.shippingInCents, 0)
  assert.equal(response.summary.totalInCents, 0)
})

function makeRow(input: {
  id: string
  quantity: number
  priceInCents?: number
  status?: 'active' | 'saved_for_later'
}) {
  return {
    item: {
      id: input.id,
      userId: 'user-1',
      productId: 'product-1',
      quantity: input.quantity,
      status: input.status ?? 'active',
      createdAt,
      updatedAt: createdAt,
    },
    product: {
      id: 'product-1',
      storeId: 'store-1',
      storeName: 'Loja Hub44',
      storeSlug: 'loja-hub44',
      storeStatus: 'approved',
      categoryId: 'category-1',
      categoryName: 'Moda',
      name: 'Produto',
      slug: 'produto',
      description: null,
      priceInCents: input.priceInCents ?? 5000,
      imageUrl: null,
      stock: 10,
      status: 'active',
    },
  } as unknown as CartItemWithProduct
}
