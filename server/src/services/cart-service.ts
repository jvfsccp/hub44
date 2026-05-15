import type {
  CartItemStatus,
  CartItemWithProduct,
} from '@/repositories/cart-repository'
import { CartRepository } from '@/repositories/cart-repository'
import { ProductsRepository } from '@/repositories/products-repository'

type CartSummaryInput = {
  userId: string
  couponCode?: string | null
}

type AddCartItemInput = {
  userId: string
  productId: string
  quantity: number
}

type CartItemActionInput = {
  userId: string
  cartItemId: string
}

type UpdateCartItemInput = CartItemActionInput & {
  quantity: number
}

const activeStatus: CartItemStatus = 'active'
const savedStatus: CartItemStatus = 'saved_for_later'
const defaultShippingInCents = 2490

export class EmptyCartError extends Error {
  constructor() {
    super('Cart must have at least one active item')
  }
}

export class CartItemNotFoundError extends Error {
  constructor() {
    super('Cart item not found')
  }
}

export class CartProductUnavailableError extends Error {
  constructor(productId: string) {
    super(`Product ${productId} is unavailable`)
  }
}

export class CartInsufficientStockError extends Error {
  constructor(productName: string) {
    super(`Insufficient stock for product ${productName}`)
  }
}

export class CartService {
  constructor(
    private readonly cartRepository = new CartRepository(),
    private readonly productsRepository = new ProductsRepository(),
  ) {}

  async getCart(input: CartSummaryInput) {
    const rows = await this.cartRepository.listByUserId(input.userId)

    return toCartResponse(rows, input.couponCode)
  }

  async addItem(input: AddCartItemInput) {
    const product = await this.getAvailableProduct(input.productId)
    const currentItem = await this.cartRepository.findByUserProductStatus({
      userId: input.userId,
      productId: input.productId,
      status: activeStatus,
    })
    const nextQuantity = (currentItem?.quantity ?? 0) + input.quantity

    this.ensureStock(product, nextQuantity)

    if (currentItem) {
      await this.cartRepository.updateQuantity(currentItem.id, nextQuantity)
    } else {
      await this.cartRepository.create({
        userId: input.userId,
        productId: input.productId,
        quantity: input.quantity,
        status: activeStatus,
      })
    }

    return this.getCart({ userId: input.userId })
  }

  async updateItem(input: UpdateCartItemInput) {
    const item = await this.getOwnedItem(input)

    if (item.status === activeStatus) {
      const product = await this.getAvailableProduct(item.productId)
      this.ensureStock(product, input.quantity)
    }

    await this.cartRepository.updateQuantity(item.id, input.quantity)

    return this.getCart({ userId: input.userId })
  }

  async removeItem(input: CartItemActionInput) {
    const item = await this.getOwnedItem(input)
    await this.cartRepository.delete(item.id)

    return this.getCart({ userId: input.userId })
  }

  async saveForLater(input: CartItemActionInput) {
    const item = await this.getOwnedItem(input)

    if (item.status === savedStatus) {
      return this.getCart({ userId: input.userId })
    }

    const savedItem = await this.cartRepository.findByUserProductStatus({
      userId: input.userId,
      productId: item.productId,
      status: savedStatus,
    })

    if (savedItem) {
      await this.cartRepository.updateQuantity(
        savedItem.id,
        savedItem.quantity + item.quantity,
      )
      await this.cartRepository.delete(item.id)
    } else {
      await this.cartRepository.updateStatus(item.id, savedStatus)
    }

    return this.getCart({ userId: input.userId })
  }

  async moveToCart(input: CartItemActionInput) {
    const item = await this.getOwnedItem(input)

    if (item.status === activeStatus) {
      return this.getCart({ userId: input.userId })
    }

    const product = await this.getAvailableProduct(item.productId)
    const activeItem = await this.cartRepository.findByUserProductStatus({
      userId: input.userId,
      productId: item.productId,
      status: activeStatus,
    })
    const nextQuantity = (activeItem?.quantity ?? 0) + item.quantity

    this.ensureStock(product, nextQuantity)

    if (activeItem) {
      await this.cartRepository.updateQuantity(activeItem.id, nextQuantity)
      await this.cartRepository.delete(item.id)
    } else {
      await this.cartRepository.updateStatus(item.id, activeStatus)
    }

    return this.getCart({ userId: input.userId })
  }

  async clearCart(userId: string) {
    await this.cartRepository.clearByUserIdAndStatus(userId, activeStatus)

    return this.getCart({ userId })
  }

  async getActiveOrderItems(userId: string) {
    const rows = await this.cartRepository.listByUserId(userId)
    const items = rows.filter((row) => row.item.status === activeStatus)

    if (items.length === 0) {
      throw new EmptyCartError()
    }

    return items.map((row) => ({
      productId: row.item.productId,
      quantity: row.item.quantity,
    }))
  }

  async clearActiveCart(userId: string) {
    await this.cartRepository.clearByUserIdAndStatus(userId, activeStatus)
  }

  private async getOwnedItem(input: CartItemActionInput) {
    const item = await this.cartRepository.findByUserIdAndId({
      userId: input.userId,
      id: input.cartItemId,
    })

    if (!item) {
      throw new CartItemNotFoundError()
    }

    return item
  }

  private async getAvailableProduct(productId: string) {
    const [product] = await this.productsRepository.findPublicByIds([productId])

    if (!product) {
      throw new CartProductUnavailableError(productId)
    }

    return product
  }

  private ensureStock(
    product: Awaited<ReturnType<ProductsRepository['findPublicByIds']>>[number],
    quantity: number,
  ) {
    if (product.stock < quantity) {
      throw new CartInsufficientStockError(product.name)
    }
  }
}

export function toCartResponse(
  rows: CartItemWithProduct[],
  couponCode?: string | null,
) {
  const items = rows
    .filter((row) => row.item.status === activeStatus)
    .map(toCartItemResponse)
  const savedItems = rows
    .filter((row) => row.item.status === savedStatus)
    .map(toCartItemResponse)
  const subtotalInCents = items.reduce(
    (total, item) => total + item.subtotalInCents,
    0,
  )
  const normalizedCouponCode = couponCode?.trim().toUpperCase() || null
  const discountInCents =
    normalizedCouponCode === 'HUB44' ? Math.round(subtotalInCents * 0.1) : 0
  const shippingInCents = items.length > 0 ? defaultShippingInCents : 0

  return {
    items,
    savedItems,
    summary: {
      itemsCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotalInCents,
      shippingInCents,
      discountInCents,
      totalInCents: subtotalInCents + shippingInCents - discountInCents,
      couponCode: normalizedCouponCode,
    },
  }
}

function toCartItemResponse(row: CartItemWithProduct) {
  const available =
    row.product.status === 'active' &&
    row.product.storeStatus === 'approved' &&
    row.product.stock >= row.item.quantity

  return {
    id: row.item.id,
    productId: row.item.productId,
    storeId: row.product.storeId,
    storeName: row.product.storeName,
    storeSlug: row.product.storeSlug,
    categoryId: row.product.categoryId,
    categoryName: row.product.categoryName,
    name: row.product.name,
    slug: row.product.slug,
    description: row.product.description,
    imageUrl: row.product.imageUrl,
    quantity: row.item.quantity,
    status: row.item.status,
    unitPriceInCents: row.product.priceInCents,
    subtotalInCents: row.product.priceInCents * row.item.quantity,
    stock: row.product.stock,
    available,
    createdAt: row.item.createdAt.toISOString(),
    updatedAt: row.item.updatedAt.toISOString(),
  }
}
