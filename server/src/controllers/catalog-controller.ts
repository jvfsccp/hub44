import type { FastifyReply, FastifyRequest } from 'fastify'

import { CatalogService } from '@/services/catalog-service'

type ListProductsRequest = FastifyRequest<{
  Querystring: {
    categoryId?: string
    storeId?: string
  }
}>

type ListProductImagesRequest = FastifyRequest<{
  Params: {
    productId: string
  }
}>

export class CatalogController {
  constructor(private readonly catalogService = new CatalogService()) {}

  listCategories = async (_request: FastifyRequest, reply: FastifyReply) => {
    const categories = await this.catalogService.listCategories()

    return reply.status(200).send({ categories })
  }

  listStores = async (_request: FastifyRequest, reply: FastifyReply) => {
    const stores = await this.catalogService.listStores()

    return reply.status(200).send({ stores })
  }

  listProducts = async (request: ListProductsRequest, reply: FastifyReply) => {
    const products = await this.catalogService.listProducts(request.query)

    return reply.status(200).send({ products })
  }

  listProductImages = async (
    request: ListProductImagesRequest,
    reply: FastifyReply,
  ) => {
    const images = await this.catalogService.listProductImages(
      request.params.productId,
    )

    if (!images) {
      return reply.status(404).send({ message: 'Product not found' })
    }

    return reply.status(200).send({ images })
  }
}
