import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  CategoriesService,
  CategoryAlreadyExistsError,
  InvalidSlugError,
  toCategoryResponse,
} from '@/services/categories-service'

type CreateCategoryRequest = FastifyRequest<{
  Body: {
    name: string
    slug?: string
    description?: string | null
  }
}>

export class CategoriesController {
  constructor(private readonly categoriesService = new CategoriesService()) {}

  create = async (request: CreateCategoryRequest, reply: FastifyReply) => {
    try {
      const category = await this.categoriesService.create(request.body)

      return reply.status(201).send({
        category: toCategoryResponse(category),
      })
    } catch (error) {
      if (error instanceof CategoryAlreadyExistsError) {
        return reply.status(409).send({ message: error.message })
      }

      if (error instanceof InvalidSlugError) {
        return reply.status(400).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Internal server error' })
    }
  }
}
