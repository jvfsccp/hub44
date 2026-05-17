import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  CategoryNotFoundError,
  InvalidSlugError as InvalidProductSlugError,
  ProductAlreadyExistsError,
  ProductNotFoundError,
  type ProductStatus,
  ProductsService,
  toProductResponse,
} from '@/services/products-service'
import {
  InvalidSlugError as InvalidStoreSlugError,
  StoreAccessDeniedError,
  StoreAlreadyExistsError,
  type StoreImageKind,
  StoreNotFoundError,
  StoresService,
  toStoreResponse,
} from '@/services/stores-service'
import { sendInternalServerError } from '@/utils/internal-server-error'
import { MultipartFormError, readMultipartForm } from '@/utils/multipart-form'

type CreateStoreRequest = FastifyRequest<{
  Body: {
    name: string
    slug?: string
    description: string
    cnpj: string
    phone: string
  }
}>

type CreateProductRequest = FastifyRequest<{
  Params: { storeId: string }
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

type UploadProductImageRequest = FastifyRequest<{
  Params: { storeId: string; productId: string }
}>

type UploadStoreImageRequest = FastifyRequest<{
  Params: { storeId: string }
}>

export class StoresController {
  constructor(
    private readonly storesService = new StoresService(),
    private readonly productsService = new ProductsService(),
  ) {}

  create = async (request: CreateStoreRequest, reply: FastifyReply) => {
    try {
      const store = await this.storesService.create({
        ownerId: request.user.sub,
        ...request.body,
      })

      return reply.status(201).send({ store: toStoreResponse(store) })
    } catch (error) {
      return handleStoreError(error, reply)
    }
  }

  createProduct = async (
    request: CreateProductRequest,
    reply: FastifyReply,
  ) => {
    try {
      const product = await this.productsService.create({
        ownerId: request.user.sub,
        role: request.user.role,
        storeId: request.params.storeId,
        ...request.body,
      })

      return reply.status(201).send({
        product: toProductResponse(product),
      })
    } catch (error) {
      return handleProductError(error, reply)
    }
  }

  uploadLogo = async (request: UploadStoreImageRequest, reply: FastifyReply) =>
    this.uploadStoreImage(request, reply, 'logo')

  uploadBanner = async (
    request: UploadStoreImageRequest,
    reply: FastifyReply,
  ) => this.uploadStoreImage(request, reply, 'banner')

  uploadProductImage = async (
    request: UploadProductImageRequest,
    reply: FastifyReply,
  ) => {
    try {
      const form = await readMultipartForm(request, { fileFields: ['image'] })
      const image = form.files.image

      if (!image) {
        return reply.status(400).send({ message: 'Field image is required' })
      }

      const product = await this.productsService.uploadImage({
        ownerId: request.user.sub,
        role: request.user.role,
        storeId: request.params.storeId,
        productId: request.params.productId,
        image,
      })

      return reply.status(200).send({
        product: toProductResponse(product),
      })
    } catch (error) {
      return handleProductError(error, reply)
    }
  }

  private async uploadStoreImage(
    request: UploadStoreImageRequest,
    reply: FastifyReply,
    kind: StoreImageKind,
  ) {
    try {
      const form = await readMultipartForm(request, { fileFields: ['image'] })
      const image = form.files.image

      if (!image) {
        return reply.status(400).send({ message: 'Field image is required' })
      }

      const store = await this.storesService.uploadImage({
        ownerId: request.user.sub,
        role: request.user.role,
        storeId: request.params.storeId,
        kind,
        image,
      })

      return reply.status(200).send({
        store: toStoreResponse(store),
      })
    } catch (error) {
      return handleStoreError(error, reply)
    }
  }
}

function handleStoreError(error: unknown, reply: FastifyReply) {
  if (error instanceof StoreAlreadyExistsError) {
    return reply.status(409).send({ message: error.message })
  }

  if (error instanceof InvalidStoreSlugError) {
    return reply.status(400).send({ message: error.message })
  }

  return handleSharedError(error, reply)
}

export function handleProductError(error: unknown, reply: FastifyReply) {
  if (error instanceof CategoryNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof ProductNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof ProductAlreadyExistsError) {
    return reply.status(409).send({ message: error.message })
  }

  if (error instanceof InvalidProductSlugError) {
    return reply.status(400).send({ message: error.message })
  }

  return handleSharedError(error, reply)
}

export function handleSharedError(error: unknown, reply: FastifyReply) {
  if (error instanceof StoreNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof StoreAccessDeniedError) {
    return reply.status(403).send({ message: error.message })
  }

  if (error instanceof MultipartFormError) {
    return reply.status(400).send({ message: error.message })
  }

  const multipartErrorStatus = getMultipartErrorStatus(error)

  if (multipartErrorStatus) {
    return reply.status(multipartErrorStatus).send({
      message: error instanceof Error ? error.message : 'Invalid upload',
    })
  }

  return sendInternalServerError(error, reply, 'stores')
}

function getMultipartErrorStatus(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null
  }

  const code = (error as { code?: unknown }).code

  if (code === 'FST_REQ_FILE_TOO_LARGE') {
    return 413
  }

  if (typeof code === 'string' && code.startsWith('FST_')) {
    return 400
  }

  return null
}
