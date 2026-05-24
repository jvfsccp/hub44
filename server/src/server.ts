import fastifyCookie from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { type FastifyRequest, fastify } from 'fastify'
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
import { seedImageRoutes } from '@/routes/seed-image-routes'
import { sellerRoutes } from '@/routes/seller-routes'
import { storesRoutes } from '@/routes/stores-routes'
import { usersRoutes } from '@/routes/users-routes'
import { toErrorLogPayload } from '@/utils/internal-server-error'

const requestStartTimes = new WeakMap<FastifyRequest, number>()

const logger = {
  level: env.LOG_LEVEL,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  ...(env.NODE_ENV === 'production'
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: Boolean(process.stdout.isTTY),
            ignore:
              'pid,hostname,reqId,method,url,statusCode,durationMs,port,docsUrl',
            translateTime: 'SYS:standard',
          },
        },
      }),
}

const app = fastify({
  disableRequestLogging: true,
  logger,
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler((error, request, reply) => {
  const errorStatusCode = getErrorStatusCode(error)
  const statusCode =
    errorStatusCode && errorStatusCode < 500 ? errorStatusCode : 500
  const payload = {
    ...toErrorLogPayload(error),
    method: request.method,
    url: request.url,
    statusCode,
  }

  if (statusCode >= 500) {
    request.log.error(
      payload,
      `${request.method} ${request.url} uncaught internal server error`,
    )

    return reply.status(500).send({ message: 'Internal server error' })
  }

  request.log.warn(payload, `${request.method} ${request.url} request error`)

  return reply.status(statusCode).send({ message: getErrorMessage(error) })
})

app.addHook('onRequest', async (request) => {
  if (shouldSkipRequestLog(request)) {
    return
  }

  requestStartTimes.set(request, Date.now())
  request.log.info(
    {
      method: request.method,
      url: request.url,
    },
    `${request.method} ${request.url} started`,
  )
})

app.addHook('onResponse', async (request, reply) => {
  if (shouldSkipRequestLog(request)) {
    return
  }

  const startedAt = requestStartTimes.get(request)
  const durationMs = startedAt ? Date.now() - startedAt : undefined
  const payload = {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    durationMs,
  }
  const durationLabel =
    typeof durationMs === 'number' ? `${durationMs}ms` : 'unknown duration'
  const message = `${request.method} ${request.url} -> ${reply.statusCode} (${durationLabel})`

  if (reply.statusCode >= 500) {
    request.log.error(payload, message)
    return
  }

  if (reply.statusCode >= 400) {
    request.log.warn(payload, message)
    return
  }

  request.log.info(payload, message)
})

function shouldSkipRequestLog(request: FastifyRequest) {
  return request.url === '/health'
}

function getErrorStatusCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) {
    return null
  }

  const { statusCode } = error as { statusCode?: unknown }

  return typeof statusCode === 'number' ? statusCode : null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Request error'
}

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

app.get('/health', async () => {
  return { status: 'ok' }
})

app.register(authRoutes)
app.register(usersRoutes)
app.register(cartRoutes)
app.register(catalogRoutes)
app.register(seedImageRoutes)
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
    app.log.info(
      { port: env.PORT },
      `HTTP server running on http://localhost:${env.PORT}`,
    )
    app.log.info(
      { docsUrl: `http://localhost:${env.PORT}/docs` },
      `API docs available at http://localhost:${env.PORT}/docs`,
    )
  })
  .catch((err) => {
    app.log.error(err)
    process.exit(1)
  })
