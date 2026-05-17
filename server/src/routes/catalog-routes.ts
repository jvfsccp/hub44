import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CatalogController } from '@/controllers/catalog-controller'

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const storeStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'inactive',
])
const productStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'inactive',
  'out_of_stock',
])
const storeSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  cnpj: z.string(),
  phone: z.string(),
  logoUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  status: storeStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
const productCatalogSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  storeName: z.string(),
  storeSlug: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  priceInCents: z.number().int(),
  stock: z.number().int(),
  imageUrl: z.string().nullable(),
  imageUrls: z.array(z.string()),
  status: productStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const catalogRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new CatalogController()

  app.get(
    '/categories',
    {
      schema: {
        summary: 'List public product categories',
        tags: ['Catalog'],
        response: {
          200: z.object({ categories: z.array(categorySchema) }),
        },
      },
    },
    controller.listCategories,
  )

  app.get(
    '/stores',
    {
      schema: {
        summary: 'List approved stores',
        tags: ['Catalog'],
        response: {
          200: z.object({ stores: z.array(storeSchema) }),
        },
      },
    },
    controller.listStores,
  )

  app.get(
    '/products',
    {
      schema: {
        summary: 'List active public products',
        tags: ['Catalog'],
        querystring: z.object({
          categoryId: z.string().optional(),
          storeId: z.string().optional(),
        }),
        response: {
          200: z.object({ products: z.array(productCatalogSchema) }),
        },
      },
    },
    controller.listProducts,
  )
}
