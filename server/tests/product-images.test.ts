import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildProductImageUrls } from '../src/utils/product-images'

test('includes the primary product image before gallery images', () => {
  const urls = buildProductImageUrls({
    imageUrl: 'https://storage.example/main.png',
    imageUrls: [
      'https://storage.example/detail-1.png',
      'https://storage.example/detail-2.png',
    ],
  })

  assert.deepEqual(urls, [
    'https://storage.example/main.png',
    'https://storage.example/detail-1.png',
    'https://storage.example/detail-2.png',
  ])
})

test('removes duplicated and empty product image urls', () => {
  const urls = buildProductImageUrls({
    imageUrl: ' https://storage.example/main.png ',
    imageUrls: [
      'https://storage.example/main.png',
      '',
      null,
      'https://storage.example/detail.png',
    ],
  })

  assert.deepEqual(urls, [
    'https://storage.example/main.png',
    'https://storage.example/detail.png',
  ])
})
