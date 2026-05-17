import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { SellerController } from '@/controllers/seller-controller'
import { SellerProductsController } from '@/controllers/seller-products-controller'
import { authenticate } from '@/middlewares/authenticate'
import { authorizeRoles } from '@/middlewares/authorize-roles'

const messageSchema = z.object({ message: z.string() })
const roleSchema = z.enum(['customer', 'seller', 'admin'])
const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  role: roleSchema,
})
const storeStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'inactive',
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
const productStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'inactive',
  'out_of_stock',
])
const productSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  priceInCents: z.number().int(),
  stock: z.number().int(),
  imageUrl: z.string().nullable(),
  status: productStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
const addressBodySchema = z.object({
  street: z.string().trim().min(1),
  number: z.string().trim().min(1),
  complement: z.string().trim().min(1).nullable().optional(),
  district: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(2).max(2),
  zipCode: z.string().trim().min(8),
})
const addressSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  storeId: z.string().nullable(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  district: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const updateStoreBodySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    cnpj: z.string().trim().min(14).optional(),
    phone: z.string().trim().min(10).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  })

const productBodySchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).nullable().optional(),
  priceInCents: z.number().int().positive(),
  stock: z.number().int().nonnegative().optional(),
  status: productStatusSchema.optional(),
})
const updateProductBodySchema = productBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  })

export const sellerRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new SellerController()
  const productsController = new SellerProductsController()

  app.post(
    '/seller/onboarding',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Create seller store onboarding',
        tags: ['Seller'],
        body: z.object({
          store: z.object({
            name: z.string().trim().min(1),
            slug: z.string().trim().min(1).optional(),
            description: z.string().trim().min(1),
            cnpj: z.string().trim().min(14),
            phone: z.string().trim().min(10),
          }),
          address: addressBodySchema,
        }),
        response: {
          201: z.object({
            store: storeSchema,
            address: addressSchema,
            user: publicUserSchema,
            accessToken: z.string(),
          }),
          400: messageSchema,
          401: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.onboard,
  )

  app.get(
    '/seller/store',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Get authenticated seller store',
        tags: ['Seller'],
        response: {
          200: z.object({
            store: storeSchema,
            addresses: z.array(addressSchema),
          }),
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.getStore,
  )

  app.patch(
    '/seller/store',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Update authenticated seller store',
        tags: ['Seller'],
        body: updateStoreBodySchema,
        response: {
          200: z.object({
            store: storeSchema,
            addresses: z.array(addressSchema),
          }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.updateStore,
  )

  app.post(
    '/seller/store/logo',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Upload authenticated seller store logo',
        description:
          'Send as multipart/form-data with a single image file field named image.',
        tags: ['Seller'],
        response: {
          200: z.object({ store: storeSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.uploadStoreLogo,
  )

  app.post(
    '/seller/store/banner',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Upload authenticated seller store banner',
        description:
          'Send as multipart/form-data with a single image file field named image.',
        tags: ['Seller'],
        response: {
          200: z.object({ store: storeSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.uploadStoreBanner,
  )

  app.get(
    '/seller/products',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'List authenticated seller products',
        tags: ['Seller Products'],
        response: {
          200: z.object({ products: z.array(productSchema) }),
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    productsController.list,
  )

  app.post(
    '/seller/products',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Create product for authenticated seller store',
        tags: ['Seller Products'],
        body: productBodySchema,
        response: {
          201: z.object({ product: productSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    productsController.create,
  )

  app.patch(
    '/seller/products/:productId',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Update seller product',
        tags: ['Seller Products'],
        params: z.object({
          productId: z.string().min(1),
        }),
        body: updateProductBodySchema,
        response: {
          200: z.object({ product: productSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    productsController.update,
  )

  app.patch(
    '/seller/products/:productId/status',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Update seller product status',
        tags: ['Seller Products'],
        params: z.object({
          productId: z.string().min(1),
        }),
        body: z.object({
          status: productStatusSchema,
        }),
        response: {
          200: z.object({ product: productSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    productsController.updateStatus,
  )

  app.post(
    '/seller/products/:productId/image',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Upload seller product image',
        description:
          'Send as multipart/form-data with a single image file field named image.',
        tags: ['Seller Products'],
        params: z.object({
          productId: z.string().min(1),
        }),
        response: {
          200: z.object({ product: productSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    productsController.uploadImage,
  )
}
