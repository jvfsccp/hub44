import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { AuthController } from '@/controllers/auth-controller'
import { authenticate } from '@/middlewares/authenticate'

const roleSchema = z.enum(['customer', 'seller', 'admin'])
const registerRoleSchema = z.enum(['customer', 'seller'])
const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  role: roleSchema,
})
const authUserSchema = z.object({
  sub: z.string(),
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  role: roleSchema,
})
const messageSchema = z.object({ message: z.string() })

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new AuthController()

  app.post(
    '/auth/register',
    {
      schema: {
        summary: 'Register a new customer or seller user',
        tags: ['Auth'],
        body: z.object({
          name: z.string().min(2),
          email: z.email(),
          phone: z.string().min(10),
          password: z.string().min(8),
          role: registerRoleSchema.optional().default('customer'),
        }),
        response: {
          201: z.object({ user: publicUserSchema }),
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.register,
  )

  app.post(
    '/auth/login',
    {
      schema: {
        summary: 'Login with email and password',
        tags: ['Auth'],
        body: z.object({
          email: z.email(),
          password: z.string().min(1),
        }),
        response: {
          200: z.object({
            accessToken: z.string(),
            user: publicUserSchema,
          }),
          401: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.login,
  )

  app.get(
    '/auth/me',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Get current user',
        tags: ['Auth'],
        response: {
          200: z.object({ user: authUserSchema }),
          401: messageSchema,
        },
      },
    },
    controller.me,
  )

  app.post(
    '/auth/refresh',
    {
      schema: {
        summary: 'Refresh access token',
        tags: ['Auth'],
        response: {
          200: z.object({
            accessToken: z.string(),
            user: authUserSchema,
          }),
          401: messageSchema,
        },
      },
    },
    controller.refresh,
  )

  app.post(
    '/auth/logout',
    {
      schema: {
        summary: 'Logout and clear refresh token',
        tags: ['Auth'],
        response: {
          200: messageSchema,
        },
      },
    },
    controller.logout,
  )
}
