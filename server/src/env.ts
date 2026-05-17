import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .trim()
    .min(32)
    .refine((key) => key.split('.').length === 3, {
      message:
        'SUPABASE_SERVICE_ROLE_KEY must be the full Supabase service_role JWT',
    }),
  SUPABASE_STORAGE_BUCKET: z.string().min(1),
  KAFKA_BROKER: z.string().min(1).default('localhost:9092'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
})

export const env = envSchema.parse(process.env)
