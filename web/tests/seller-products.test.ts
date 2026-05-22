import assert from 'node:assert/strict'
import { test } from 'node:test'

import { parsePriceToCents } from '../src/lib/seller-product-utils.ts'

test('parses Brazilian currency text to cents', () => {
  assert.equal(parsePriceToCents('R$ 189,90'), 18990)
  assert.equal(parsePriceToCents('1.234,56'), 123456)
  assert.equal(parsePriceToCents('99.9'), 9990)
})

test('rejects invalid product prices', () => {
  assert.equal(parsePriceToCents(''), null)
  assert.equal(parsePriceToCents('abc'), null)
  assert.equal(parsePriceToCents('-10'), null)
})
