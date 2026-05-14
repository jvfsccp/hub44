import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import {
  ProductsService,
  StoreNotFoundError,
  toProductResponse,
} from '@/services/products-service'
import { StoresService, toStoreResponse } from '@/services/stores-service'
import { MultipartFormError, readMultipartForm } from '@/utils/multipart-form'

const createStoreFieldsSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
})

const createProductFieldsSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.string().trim().min(1),
})

type CreateProductRequest = FastifyRequest<{
  Params: { storeId: string }
}>

export class StoresController {
  constructor(
    private readonly storesService = new StoresService(),
    private readonly productsService = new ProductsService(),
  ) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const form = await readMultipartForm(request, {
        fileFields: ['logo', 'banner'],
      })
      const fields = createStoreFieldsSchema.safeParse(form.fields)
      const logo = form.files.logo
      const banner = form.files.banner

      if (!fields.success || !logo || !banner) {
        return reply.status(400).send({
          message: 'Fields name, description, logo and banner are required',
        })
      }

      const store = await this.storesService.create({
        ...fields.data,
        logo,
        banner,
      })

      return reply.status(201).send({ store: toStoreResponse(store) })
    } catch (error) {
      return handleCreateError(error, reply)
    }
  }

  createProduct = async (
    request: CreateProductRequest,
    reply: FastifyReply,
  ) => {
    try {
      const form = await readMultipartForm(request, { fileFields: ['image'] })
      const fields = createProductFieldsSchema.safeParse(form.fields)
      const image = form.files.image

      if (!fields.success || !image) {
        return reply.status(400).send({
          message: 'Fields name, description, price and image are required',
        })
      }

      const priceInCents = parsePriceInCents(fields.data.price)

      if (!priceInCents) {
        return reply.status(400).send({
          message:
            'Field price must be a positive number with up to 2 decimals',
        })
      }

      const product = await this.productsService.create({
        storeId: request.params.storeId,
        name: fields.data.name,
        description: fields.data.description,
        priceInCents,
        image,
      })

      return reply.status(201).send({
        product: toProductResponse(product),
      })
    } catch (error) {
      if (error instanceof StoreNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      return handleCreateError(error, reply)
    }
  }
}

function parsePriceInCents(price: string) {
  const normalizedPrice = price.trim().replace(',', '.')

  if (!/^\d+(\.\d{1,2})?$/.test(normalizedPrice)) {
    return null
  }

  const [units, cents = ''] = normalizedPrice.split('.')
  const priceInCents = Number(units) * 100 + Number(cents.padEnd(2, '0'))

  return priceInCents > 0 ? priceInCents : null
}

function handleCreateError(error: unknown, reply: FastifyReply) {
  if (error instanceof MultipartFormError) {
    return reply.status(400).send({ message: error.message })
  }

  const multipartErrorStatus = getMultipartErrorStatus(error)

  if (multipartErrorStatus) {
    return reply.status(multipartErrorStatus).send({
      message: error instanceof Error ? error.message : 'Invalid upload',
    })
  }

  return reply.status(500).send({ message: 'Internal server error' })
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
