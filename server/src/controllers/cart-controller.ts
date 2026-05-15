import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  CartInsufficientStockError,
  CartItemNotFoundError,
  CartProductUnavailableError,
  CartService,
  EmptyCartError,
} from '@/services/cart-service'

type GetCartRequest = FastifyRequest<{
  Querystring: {
    couponCode?: string
  }
}>

type AddCartItemRequest = FastifyRequest<{
  Body: {
    productId: string
    quantity?: number
  }
}>

type UpdateCartItemRequest = FastifyRequest<{
  Params: { cartItemId: string }
  Body: {
    quantity: number
  }
}>

type CartItemParamsRequest = FastifyRequest<{
  Params: { cartItemId: string }
}>

export class CartController {
  constructor(private readonly cartService = new CartService()) {}

  getCart = async (request: GetCartRequest, reply: FastifyReply) => {
    const cart = await this.cartService.getCart({
      userId: request.user.sub,
      couponCode: request.query.couponCode,
    })

    return reply.status(200).send(cart)
  }

  addItem = async (request: AddCartItemRequest, reply: FastifyReply) => {
    try {
      const cart = await this.cartService.addItem({
        userId: request.user.sub,
        productId: request.body.productId,
        quantity: request.body.quantity ?? 1,
      })

      return reply.status(201).send(cart)
    } catch (error) {
      return handleCartError(error, reply)
    }
  }

  updateItem = async (request: UpdateCartItemRequest, reply: FastifyReply) => {
    try {
      const cart = await this.cartService.updateItem({
        userId: request.user.sub,
        cartItemId: request.params.cartItemId,
        quantity: request.body.quantity,
      })

      return reply.status(200).send(cart)
    } catch (error) {
      return handleCartError(error, reply)
    }
  }

  removeItem = async (request: CartItemParamsRequest, reply: FastifyReply) => {
    try {
      const cart = await this.cartService.removeItem({
        userId: request.user.sub,
        cartItemId: request.params.cartItemId,
      })

      return reply.status(200).send(cart)
    } catch (error) {
      return handleCartError(error, reply)
    }
  }

  saveForLater = async (
    request: CartItemParamsRequest,
    reply: FastifyReply,
  ) => {
    try {
      const cart = await this.cartService.saveForLater({
        userId: request.user.sub,
        cartItemId: request.params.cartItemId,
      })

      return reply.status(200).send(cart)
    } catch (error) {
      return handleCartError(error, reply)
    }
  }

  moveToCart = async (request: CartItemParamsRequest, reply: FastifyReply) => {
    try {
      const cart = await this.cartService.moveToCart({
        userId: request.user.sub,
        cartItemId: request.params.cartItemId,
      })

      return reply.status(200).send(cart)
    } catch (error) {
      return handleCartError(error, reply)
    }
  }

  clearCart = async (request: FastifyRequest, reply: FastifyReply) => {
    const cart = await this.cartService.clearCart(request.user.sub)

    return reply.status(200).send(cart)
  }
}

export function handleCartError(error: unknown, reply: FastifyReply) {
  if (error instanceof EmptyCartError) {
    return reply.status(400).send({ message: error.message })
  }

  if (error instanceof CartProductUnavailableError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof CartItemNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof CartInsufficientStockError) {
    return reply.status(409).send({ message: error.message })
  }

  return reply.status(500).send({ message: 'Internal server error' })
}
