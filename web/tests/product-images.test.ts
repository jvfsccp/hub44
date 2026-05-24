import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getProductImageUrls } from '../src/lib/product-images.ts'

test('uses fallback image when product has no images', () => {
  const urls = getProductImageUrls(
    { imageUrl: null, imageUrls: [] },
    '/fallback.png',
  )

  assert.deepEqual(urls, ['/fallback.png'])
})

test('keeps primary image and all gallery images without duplicates', () => {
  const urls = getProductImageUrls(
    {
      imageUrl: ' https://storage.example/main.png ',
      imageUrls: [
        'https://storage.example/main.png',
        'https://storage.example/detail.png',
      ],
    },
    '/fallback.png',
  )

  assert.deepEqual(urls, [
    'https://storage.example/main.png',
    'https://storage.example/detail.png',
  ])
})

test('resolves relative API product image urls', () => {
  const urls = getProductImageUrls(
    {
      imageUrl: '/seed/images/product/blusa.svg',
      imageUrls: [],
    },
    '/fallback.png',
  )

  assert.deepEqual(urls, [
    'http://localhost:3333/seed/images/product/blusa.svg',
  ])
})
