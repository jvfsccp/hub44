import { NotificationsRepository } from '@/repositories/notifications-repository'
import {
  type Order,
  type OrderEvent,
  type OrderItem,
  type OrderStatus,
  OrdersRepository,
  type PaymentMethod,
} from '@/repositories/orders-repository'
import type { ProductStatus } from '@/repositories/products-repository'
import { ProductsRepository } from '@/repositories/products-repository'
import { KafkaEventsService } from '@/services/kafka-events-service'
import {
  StoreAccessDeniedError,
  StoresService,
} from '@/services/stores-service'

type CreateOrderInput = {
  customerId: string
  addressId?: string | null
  paymentMethod: PaymentMethod
  deliveryMethod?: string
  couponCode?: string | null
  items: Array<{
    productId: string
    quantity: number
  }>
}

type OrderWithDetails = {
  order: Order
  items: OrderItem[]
  events: OrderEvent[]
}

const defaultShippingInCents = 2490

export class EmptyOrderError extends Error {
  constructor() {
    super('Order must have at least one item')
  }
}

export class ProductUnavailableError extends Error {
  constructor(productId: string) {
    super(`Product ${productId} is unavailable`)
  }
}

export class InsufficientStockError extends Error {
  constructor(productName: string) {
    super(`Insufficient stock for product ${productName}`)
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super('Order not found')
  }
}

export class OrdersService {
  constructor(
    private readonly ordersRepository = new OrdersRepository(),
    private readonly productsRepository = new ProductsRepository(),
    private readonly notificationsRepository = new NotificationsRepository(),
    private readonly storesService = new StoresService(),
    private readonly kafkaEventsService = new KafkaEventsService(),
  ) {}

  async create(input: CreateOrderInput) {
    if (input.items.length === 0) {
      throw new EmptyOrderError()
    }

    const quantities = new Map<string, number>()

    for (const item of input.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      )
    }

    const products = await this.productsRepository.findPublicByIds([
      ...quantities.keys(),
    ])

    if (products.length !== quantities.size) {
      const foundIds = new Set(products.map((product) => product.id))
      const missingProductId = [...quantities.keys()].find(
        (productId) => !foundIds.has(productId),
      )

      throw new ProductUnavailableError(missingProductId ?? 'unknown')
    }

    const groupedProducts = new Map<string, typeof products>()

    for (const product of products) {
      const quantity = quantities.get(product.id) ?? 0

      if (quantity <= 0) {
        throw new EmptyOrderError()
      }

      if (product.stock < quantity) {
        throw new InsufficientStockError(product.name)
      }

      groupedProducts.set(product.storeId, [
        ...(groupedProducts.get(product.storeId) ?? []),
        product,
      ])
    }

    const createdOrders: OrderWithDetails[] = []

    for (const [storeId, storeProducts] of groupedProducts) {
      const subtotalInCents = storeProducts.reduce((total, product) => {
        const quantity = quantities.get(product.id) ?? 0

        return total + product.priceInCents * quantity
      }, 0)
      const discountInCents =
        input.couponCode?.trim().toUpperCase() === 'HUB44'
          ? Math.round(subtotalInCents * 0.1)
          : 0
      const shippingInCents = defaultShippingInCents
      const totalInCents = subtotalInCents + shippingInCents - discountInCents
      const order = await this.ordersRepository.create({
        customerId: input.customerId,
        storeId,
        addressId: input.addressId ?? null,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'paid',
        status: 'confirmed',
        deliveryMethod: input.deliveryMethod ?? 'standard',
        subtotalInCents,
        shippingInCents,
        discountInCents,
        totalInCents,
      })
      const items = await this.ordersRepository.createItems(
        storeProducts.map((product) => {
          const quantity = quantities.get(product.id) ?? 0

          return {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            productImageUrl: product.imageUrl,
            quantity,
            unitPriceInCents: product.priceInCents,
            subtotalInCents: product.priceInCents * quantity,
          }
        }),
      )
      const event = await this.ordersRepository.createEvent({
        orderId: order.id,
        status: order.status,
        message: 'Pedido criado e pagamento aprovado.',
        metadata: { source: 'checkout' },
      })

      for (const product of storeProducts) {
        const quantity = quantities.get(product.id) ?? 0
        const nextStock = product.stock - quantity
        const nextStatus: ProductStatus =
          nextStock === 0 ? 'out_of_stock' : product.status

        await this.productsRepository.update(product.id, {
          stock: nextStock,
          status: nextStatus,
        })
      }

      await this.createAndPublishNotifications({
        order,
        sellerId: storeProducts[0].storeOwnerId,
      })
      await this.kafkaEventsService.publishOrderEvent({
        eventId: event.id,
        eventType: 'order.created',
        occurredAt: event.createdAt.toISOString(),
        payload: {
          orderId: order.id,
          customerId: order.customerId,
          storeId: order.storeId,
          status: order.status,
          totalInCents: order.totalInCents,
          itemCount: items.length,
        },
      })

      createdOrders.push({ order, items, events: [event] })
    }

    return createdOrders
  }

  async listCustomerOrders(customerId: string) {
    const orders = await this.ordersRepository.listByCustomerId(customerId)

    return Promise.all(
      orders.map(async (order) => ({
        order,
        items: await this.ordersRepository.listItemsByOrderId(order.id),
        events: await this.ordersRepository.listEventsByOrderId(order.id),
      })),
    )
  }

  async getCustomerOrder(customerId: string, orderId: string) {
    const order = await this.ordersRepository.findByCustomerIdAndId(
      customerId,
      orderId,
    )

    if (!order) {
      throw new OrderNotFoundError()
    }

    return {
      order,
      items: await this.ordersRepository.listItemsByOrderId(order.id),
      events: await this.ordersRepository.listEventsByOrderId(order.id),
    }
  }

  async listSellerOrders(ownerId: string) {
    const store = await this.storesService.getByOwnerId(ownerId)

    if (!store) {
      throw new StoreAccessDeniedError()
    }

    const orders = await this.ordersRepository.listByStoreId(store.id)

    return Promise.all(
      orders.map(async (order) => ({
        order,
        items: await this.ordersRepository.listItemsByOrderId(order.id),
        events: await this.ordersRepository.listEventsByOrderId(order.id),
      })),
    )
  }

  async updateSellerOrderStatus(input: {
    ownerId: string
    orderId: string
    status: OrderStatus
    trackingCode?: string | null
  }) {
    const store = await this.storesService.getByOwnerId(input.ownerId)

    if (!store) {
      throw new StoreAccessDeniedError()
    }

    const currentOrder = await this.ordersRepository.findByStoreIdAndId(
      store.id,
      input.orderId,
    )

    if (!currentOrder) {
      throw new OrderNotFoundError()
    }

    const order = await this.ordersRepository.updateStatus({
      orderId: input.orderId,
      status: input.status,
      trackingCode: input.trackingCode ?? currentOrder.trackingCode,
    })

    if (!order) {
      throw new OrderNotFoundError()
    }

    const event = await this.ordersRepository.createEvent({
      orderId: order.id,
      status: order.status,
      message: `Status do pedido atualizado para ${order.status}.`,
      metadata: { trackingCode: order.trackingCode },
    })
    const notification = await this.notificationsRepository.create({
      userId: order.customerId,
      orderId: order.id,
      type: 'order_status_updated',
      title: 'Pedido atualizado',
      message: `Seu pedido ${order.id} agora esta com status ${order.status}.`,
    })

    await this.kafkaEventsService.publishOrderEvent({
      eventId: event.id,
      eventType: 'order.status_updated',
      occurredAt: event.createdAt.toISOString(),
      payload: {
        orderId: order.id,
        customerId: order.customerId,
        storeId: order.storeId,
        status: order.status,
        trackingCode: order.trackingCode,
      },
    })
    await this.kafkaEventsService.publishNotificationEvent({
      eventId: notification.id,
      eventType: 'notification.created',
      occurredAt: notification.createdAt.toISOString(),
      payload: {
        notificationId: notification.id,
        userId: notification.userId,
        orderId: notification.orderId,
        type: notification.type,
      },
    })

    return {
      order,
      items: await this.ordersRepository.listItemsByOrderId(order.id),
      events: await this.ordersRepository.listEventsByOrderId(order.id),
    }
  }

  private async createAndPublishNotifications(input: {
    order: Order
    sellerId: string
  }) {
    const buyerNotification = await this.notificationsRepository.create({
      userId: input.order.customerId,
      orderId: input.order.id,
      type: 'order_created',
      title: 'Pedido confirmado',
      message: `Seu pedido ${input.order.id} foi confirmado.`,
    })
    const sellerNotification = await this.notificationsRepository.create({
      userId: input.sellerId,
      orderId: input.order.id,
      type: 'order_created',
      title: 'Novo pedido recebido',
      message: `A loja recebeu o pedido ${input.order.id}.`,
    })

    for (const notification of [buyerNotification, sellerNotification]) {
      await this.kafkaEventsService.publishNotificationEvent({
        eventId: notification.id,
        eventType: 'notification.created',
        occurredAt: notification.createdAt.toISOString(),
        payload: {
          notificationId: notification.id,
          userId: notification.userId,
          orderId: notification.orderId,
          type: notification.type,
        },
      })
    }
  }
}

export function toOrderResponse(input: OrderWithDetails) {
  return {
    id: input.order.id,
    customerId: input.order.customerId,
    storeId: input.order.storeId,
    addressId: input.order.addressId,
    status: input.order.status,
    paymentStatus: input.order.paymentStatus,
    paymentMethod: input.order.paymentMethod,
    deliveryMethod: input.order.deliveryMethod,
    trackingCode: input.order.trackingCode,
    subtotalInCents: input.order.subtotalInCents,
    shippingInCents: input.order.shippingInCents,
    discountInCents: input.order.discountInCents,
    totalInCents: input.order.totalInCents,
    createdAt: input.order.createdAt.toISOString(),
    updatedAt: input.order.updatedAt.toISOString(),
    items: input.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
      subtotalInCents: item.subtotalInCents,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    events: input.events.map((event) => ({
      id: event.id,
      status: event.status,
      message: event.message,
      metadata: event.metadata,
      createdAt: event.createdAt.toISOString(),
    })),
  }
}

export type {
  OrderStatus,
  PaymentMethod,
} from '@/repositories/orders-repository'
