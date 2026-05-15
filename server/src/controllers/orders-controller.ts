import type { FastifyReply, FastifyRequest } from 'fastify'

import { KafkaEventPublishError } from '@/services/kafka-events-service'
import {
  EmptyOrderError,
  InsufficientStockError,
  OrderNotFoundError,
  type OrderStatus,
  OrdersService,
  type PaymentMethod,
  ProductUnavailableError,
  toOrderResponse,
} from '@/services/orders-service'
import { StoreAccessDeniedError } from '@/services/stores-service'

type CreateOrderRequest = FastifyRequest<{
  Body: {
    addressId?: string | null
    paymentMethod: PaymentMethod
    deliveryMethod?: string
    couponCode?: string | null
    items: Array<{
      productId: string
      quantity: number
    }>
  }
}>

type GetOrderRequest = FastifyRequest<{
  Params: { orderId: string }
}>

type UpdateSellerOrderStatusRequest = FastifyRequest<{
  Params: { orderId: string }
  Body: {
    status: OrderStatus
    trackingCode?: string | null
  }
}>

export class OrdersController {
  constructor(private readonly ordersService = new OrdersService()) {}

  create = async (request: CreateOrderRequest, reply: FastifyReply) => {
    try {
      const orders = await this.ordersService.create({
        customerId: request.user.sub,
        ...request.body,
      })

      return reply.status(201).send({
        orders: orders.map(toOrderResponse),
      })
    } catch (error) {
      return handleOrderError(error, reply)
    }
  }

  listCustomerOrders = async (request: FastifyRequest, reply: FastifyReply) => {
    const orders = await this.ordersService.listCustomerOrders(request.user.sub)

    return reply.status(200).send({ orders: orders.map(toOrderResponse) })
  }

  getCustomerOrder = async (request: GetOrderRequest, reply: FastifyReply) => {
    try {
      const order = await this.ordersService.getCustomerOrder(
        request.user.sub,
        request.params.orderId,
      )

      return reply.status(200).send({ order: toOrderResponse(order) })
    } catch (error) {
      return handleOrderError(error, reply)
    }
  }

  listSellerOrders = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const orders = await this.ordersService.listSellerOrders(request.user.sub)

      return reply.status(200).send({ orders: orders.map(toOrderResponse) })
    } catch (error) {
      return handleOrderError(error, reply)
    }
  }

  updateSellerOrderStatus = async (
    request: UpdateSellerOrderStatusRequest,
    reply: FastifyReply,
  ) => {
    try {
      const order = await this.ordersService.updateSellerOrderStatus({
        ownerId: request.user.sub,
        orderId: request.params.orderId,
        status: request.body.status,
        trackingCode: request.body.trackingCode,
      })

      return reply.status(200).send({ order: toOrderResponse(order) })
    } catch (error) {
      return handleOrderError(error, reply)
    }
  }
}

function handleOrderError(error: unknown, reply: FastifyReply) {
  if (error instanceof EmptyOrderError) {
    return reply.status(400).send({ message: error.message })
  }

  if (error instanceof ProductUnavailableError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof InsufficientStockError) {
    return reply.status(409).send({ message: error.message })
  }

  if (error instanceof OrderNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof StoreAccessDeniedError) {
    return reply.status(403).send({ message: error.message })
  }

  if (error instanceof KafkaEventPublishError) {
    return reply.status(503).send({
      message: `Kafka unavailable: ${error.message}`,
    })
  }

  return reply.status(500).send({ message: 'Internal server error' })
}
