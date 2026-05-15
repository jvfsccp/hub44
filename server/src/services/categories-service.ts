import type { Category } from '@/repositories/categories-repository'
import { CategoriesRepository } from '@/repositories/categories-repository'
import { createSlug } from '@/utils/slug'

type CreateCategoryInput = {
  name: string
  slug?: string
  description?: string | null
}

export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super('Category slug already exists')
  }
}

export class InvalidSlugError extends Error {
  constructor() {
    super('Slug must contain at least one letter or number')
  }
}

export class CategoriesService {
  constructor(
    private readonly categoriesRepository = new CategoriesRepository(),
  ) {}

  async create(input: CreateCategoryInput) {
    const slug = createSlug(input.slug ?? input.name)

    if (!slug) {
      throw new InvalidSlugError()
    }

    const existingCategory = await this.categoriesRepository.findBySlug(slug)

    if (existingCategory) {
      throw new CategoryAlreadyExistsError()
    }

    return this.categoriesRepository.create({
      name: input.name,
      slug,
      description: input.description ?? null,
    })
  }
}

export function toCategoryResponse(category: Category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}
