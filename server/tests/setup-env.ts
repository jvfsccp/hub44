process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-chars'
process.env.SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  'header.payload.signature-with-at-least-thirty-two-chars'
process.env.SUPABASE_STORAGE_BUCKET = 'test-bucket'
process.env.KAFKA_BROKER = 'localhost:9092'
process.env.LOG_LEVEL = 'silent'
