import type { FastifyReply, FastifyRequest } from 'fastify'

import { handleProductError } from '@/controllers/stores-controller'
import {
  type ProductStatus,
  ProductsService,
  toProductResponse,
} from '@/services/products-service'
import { SellerService } from '@/services/seller-service'
import { readMultipartForm } from '@/utils/multipart-form'

type CreateSellerProductRequest = FastifyRequest<{
  Body: {
    categoryId: string
    name: string
    slug?: string
    description?: string | null
    priceInCents: number
    stock?: number
    status?: ProductStatus
  }
}>

type UpdateSellerProductRequest = FastifyRequest<{
  Params: { productId: string }
  Body: Partial<{
    categoryId: string
    name: string
    slug: string
    description: string | null
    priceInCents: number
    stock: number
    status: ProductStatus
  }>
}>

type UpdateSellerProductStatusRequest = FastifyRequest<{
  Params: { productId: string }
  Body: { status: ProductStatus }
}>

type UploadSellerProductImageRequest = FastifyRequest<{
  Params: { productId: string }
}>

export class SellerProductsController {
  constructor(
    private readonly sellerService = new SellerService(),
    private readonly productsService = new ProductsService(),
  ) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { store } = await this.sellerService.getStore(request.user.sub)
      const products = await this.productsService.listByStore(
        request.user.sub,
        store.id,
      )

      return reply.status(200).send({
        products: products.map(toProductResponse),
      })
    } catch (error) {
      return handleProductError(error, reply)
    }
  }

  create = async (request: CreateSellerProductRequest, reply: FastifyReply) => {
    try {
      const { store } = await this.sellerService.getStore(request.user.sub)
      const product = await this.productsService.create({
        ownerId: request.user.sub,
        storeId: store.id,
        ...request.body,
        status: request.body.status ?? 'draft',
      })

      return reply.status(201).send({ product: toProductResponse(product) })
    } catch (error) {
      return handleProductError(error, reply)
    }
  }

  update = async (request: UpdateSellerProductRequest, reply: FastifyReply) => {
    try {
      const { store } = await this.sellerService.getStore(request.user.sub)
      const product = await this.productsService.update({
        ownerId: request.user.sub,
        storeId: store.id,
        productId: request.params.productId,
        ...request.body,
      })

      return reply.status(200).send({ product: toProductResponse(product) })
    } catch (error) {
      return handleProductError(error, reply)
    }
  }

  updateStatus = async (
    request: UpdateSellerProductStatusRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { store } = await this.sellerService.getStore(request.user.sub)
      const product = await this.productsService.updateStatus({
        ownerId: request.user.sub,
        storeId: store.id,
        productId: request.params.productId,
        status: request.body.status,
      })

      return reply.status(200).send({ product: toProductResponse(product) })
    } catch (error) {
      return handleProductError(error, reply)
    }
  }

  uploadImage = async (
    request: UploadSellerProductImageRequest,
    reply: FastifyReply,
  ) => {
    try {
      const { store } = await this.sellerService.getStore(request.user.sub)
      const form = await readMultipartForm(request, { fileFields: ['image'] })
      const image = form.files.image

      if (!image) {
        return reply.status(400).send({ message: 'Field image is required' })
      }

      const product = await this.productsService.uploadImage({
        ownerId: request.user.sub,
        storeId: store.id,
        productId: request.params.productId,
        image,
      })

      return reply.status(200).send({ product: toProductResponse(product) })
    } catch (error) {
      return handleProductError(error, reply)
    }
  }
}
