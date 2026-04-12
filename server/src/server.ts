import { fastify } from 'fastify'
import { producer } from './kafka'
import { startConsumer } from './consumer'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { fastifySwagger } from '@fastify/swagger'
import { fastifyCors } from '@fastify/cors'
import ScalarApiReference from '@scalar/fastify-api-reference'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // credentials: true,
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

app.post('/test-kafka', async (request, reply) => {
  await producer.send({
    topic: 'hub44.test',
    messages: [
      { value: 'Mensagem enviada pelo backend ' }
    ],
  })

  return {
    success: true,
    message: 'Mensagem enviada para o Kafka!',
  }
})

async function start() {
  await producer.connect()

  await startConsumer() // 👈 aqui

  await app.listen({ port: 3333, host: '0.0.0.0' })

  console.log('HTTP server running on http://localhost:3333 !')
  console.log('Docs available at http://localhost:3333/docs')
  console.log('Kafka producer connected on localhost:9092')
  console.log('Kafka consumer running and listening...')
}

start()
