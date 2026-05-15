import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { AddressesController } from '@/controllers/addresses-controller'
import { authenticate } from '@/middlewares/authenticate'

const messageSchema = z.object({ message: z.string() })
const addressBodySchema = z.object({
  recipient: z.string().trim().min(1).nullable().optional(),
  street: z.string().trim().min(1),
  number: z.string().trim().min(1),
  complement: z.string().trim().min(1).nullable().optional(),
  district: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(2).max(2),
  zipCode: z.string().trim().min(8),
  isPrimary: z.boolean().optional(),
})
const updateAddressBodySchema = addressBodySchema
  .partial()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  })
const addressSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  storeId: z.string().nullable(),
  recipient: z.string().nullable(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  district: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const addressesRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new AddressesController()

  app.get(
    '/addresses',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'List addresses for the authenticated user',
        tags: ['Addresses'],
        response: {
          200: z.object({ addresses: z.array(addressSchema) }),
          401: messageSchema,
        },
      },
    },
    controller.listUserAddresses,
  )

  app.post(
    '/addresses',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Create an address for the authenticated user',
        tags: ['Addresses'],
        body: addressBodySchema,
        response: {
          201: z.object({ address: addressSchema }),
          400: messageSchema,
          401: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.createUserAddress,
  )

  app.patch(
    '/addresses/:addressId',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Update an address for the authenticated user',
        tags: ['Addresses'],
        params: z.object({
          addressId: z.string().min(1),
        }),
        body: updateAddressBodySchema,
        response: {
          200: z.object({ address: addressSchema }),
          400: messageSchema,
          401: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.updateUserAddress,
  )

  app.patch(
    '/addresses/:addressId/primary',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Set the primary address for the authenticated user',
        tags: ['Addresses'],
        params: z.object({
          addressId: z.string().min(1),
        }),
        response: {
          200: z.object({ address: addressSchema }),
          401: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.setPrimaryUserAddress,
  )

  app.delete(
    '/addresses/:addressId',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Delete an address for the authenticated user',
        tags: ['Addresses'],
        params: z.object({
          addressId: z.string().min(1),
        }),
        response: {
          200: messageSchema,
          401: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.deleteUserAddress,
  )

  app.post(
    '/stores/:storeId/addresses',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Create an address for a store',
        tags: ['Addresses'],
        params: z.object({
          storeId: z.string().min(1),
        }),
        body: addressBodySchema,
        response: {
          201: z.object({ address: addressSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.createStoreAddress,
  )
}
