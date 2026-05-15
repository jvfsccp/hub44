import fastifyCookie from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from '@/env'
import { addressesRoutes } from '@/routes/addresses-routes'
import { adminRoutes } from '@/routes/admin-routes'
import { authRoutes } from '@/routes/auth-routes'
import { cartRoutes } from '@/routes/cart-routes'
import { catalogRoutes } from '@/routes/catalog-routes'
import { categoriesRoutes } from '@/routes/categories-routes'
import { notificationsRoutes } from '@/routes/notifications-routes'
import { ordersRoutes } from '@/routes/orders-routes'
import { sellerRoutes } from '@/routes/seller-routes'
import { storesRoutes } from '@/routes/stores-routes'
import { usersRoutes } from '@/routes/users-routes'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})

app.register(fastifyCookie)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
})

app.register(fastifyMultipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
    fields: 10,
  },
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Hub44 API',
      description: 'API documentation for Hub44',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

app.register(authRoutes)
app.register(usersRoutes)
app.register(cartRoutes)
app.register(catalogRoutes)
app.register(categoriesRoutes)
app.register(storesRoutes)
app.register(addressesRoutes)
app.register(sellerRoutes)
app.register(ordersRoutes)
app.register(notificationsRoutes)
app.register(adminRoutes)

app
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333 !')
    console.log('Docs available at http://localhost:3333/docs')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
