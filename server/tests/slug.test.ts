import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createSlug } from '../src/utils/slug'

test('creates URL-safe slugs from names with spaces and accents', () => {
  assert.equal(
    createSlug('Blazer Alfaiataria Premium'),
    'blazer-alfaiataria-premium',
  )
  assert.equal(createSlug('Moda Goiás 44'), 'moda-goias-44')
})

test('returns an empty slug when input has no letters or numbers', () => {
  assert.equal(createSlug(' !@#$ '), '')
})
