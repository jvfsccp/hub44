import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

import {
  apiRequest,
  clearAccessToken,
  resolveApiAssetUrl,
  setAccessToken,
} from '../src/lib/api.ts'

type CapturedRequest = {
  input: string | URL | Request
  init?: RequestInit
}

const capturedRequests: CapturedRequest[] = []
const storage = new Map<string, string>()

beforeEach(() => {
  capturedRequests.length = 0
  storage.clear()

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  })

  globalThis.fetch = async (input, init) => {
    capturedRequests.push({ input, init })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

test('sends JSON content type and authorization for JSON requests', async () => {
  setAccessToken('token-123')

  await apiRequest('/resource', {
    method: 'POST',
    body: JSON.stringify({ name: 'Hub44' }),
  })

  const headers = new Headers(capturedRequests[0].init?.headers)

  assert.equal(capturedRequests[0].input, 'http://localhost:3333/resource')
  assert.equal(headers.get('Content-Type'), 'application/json')
  assert.equal(headers.get('Authorization'), 'Bearer token-123')
})

test('does not force JSON content type for FormData uploads', async () => {
  clearAccessToken()
  const formData = new FormData()

  formData.set('image', new Blob(['image']), 'image.png')

  await apiRequest('/upload', {
    method: 'POST',
    body: formData,
  })

  const headers = new Headers(capturedRequests[0].init?.headers)

  assert.equal(headers.has('Content-Type'), false)
  assert.equal(headers.has('Authorization'), false)
})

test('resolves API-relative asset urls against the configured API base', () => {
  assert.equal(
    resolveApiAssetUrl('/seed/images/product/item.svg'),
    'http://localhost:3333/seed/images/product/item.svg',
  )
  assert.equal(
    resolveApiAssetUrl('https://storage.example/item.png'),
    'https://storage.example/item.png',
  )
})
