import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { CategoriesRepository } from '../src/repositories/categories-repository'
import {
  CategoriesService,
  CategoryAlreadyExistsError,
  InvalidSlugError,
} from '../src/services/categories-service'

test('creates categories with normalized slug', async () => {
  const createdValues: Array<{ name: string; slug: string }> = []
  const service = new CategoriesService({
    findBySlug: async () => null,
    create: async (input: {
      name: string
      slug: string
      description?: string | null
    }) => {
      createdValues.push({ name: input.name, slug: input.slug })
      return {
        id: 'category-1',
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        createdAt: new Date('2026-05-22T12:00:00Z'),
        updatedAt: new Date('2026-05-22T12:00:00Z'),
      }
    },
  } as unknown as CategoriesRepository)

  const category = await service.create({ name: 'Moda Goiás' })

  assert.equal(category.slug, 'moda-goias')
  assert.deepEqual(createdValues, [{ name: 'Moda Goiás', slug: 'moda-goias' }])
})

test('rejects duplicated category slugs', async () => {
  const service = new CategoriesService({
    findBySlug: async () => ({ id: 'category-1' }),
  } as unknown as CategoriesRepository)

  await assert.rejects(
    () => service.create({ name: 'Moda' }),
    CategoryAlreadyExistsError,
  )
})

test('rejects invalid category slugs', async () => {
  const service = new CategoriesService({} as CategoriesRepository)

  await assert.rejects(() => service.create({ name: '!!!' }), InvalidSlugError)
})
