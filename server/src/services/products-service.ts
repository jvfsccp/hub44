import { CategoriesRepository } from '@/repositories/categories-repository'
import type { Product } from '@/repositories/products-repository'
import { ProductsRepository } from '@/repositories/products-repository'
import { StoresService } from '@/services/stores-service'
import { getImageExtension } from '@/utils/image-extension'
import type { MultipartImage } from '@/utils/multipart-form'
import { createSlug } from '@/utils/slug'
import { uploadStoreImage } from '@/utils/upload-store-image'

type CreateProductInput = {
  ownerId: string
  storeId: string
  categoryId: string
  name: string
  slug?: string
  description?: string | null
  priceInCents: number
  stock?: number
}

type UploadProductImageInput = {
  ownerId: string
  storeId: string
  productId: string
  image: MultipartImage
}

export class CategoryNotFoundError extends Error {
  constructor() {
    super('Category not found')
  }
}

export class ProductAlreadyExistsError extends Error {
  constructor() {
    super('Product slug already exists in this store')
  }
}

export class ProductNotFoundError extends Error {
  constructor() {
    super('Product not found')
  }
}

export class InvalidSlugError extends Error {
  constructor() {
    super('Slug must contain at least one letter or number')
  }
}

export class ProductsService {
  constructor(
    private readonly productsRepository = new ProductsRepository(),
    private readonly categoriesRepository = new CategoriesRepository(),
    private readonly storesService = new StoresService(),
  ) {}

  async create(input: CreateProductInput) {
    await this.storesService.getOwnedStore(input.storeId, input.ownerId)

    const category = await this.categoriesRepository.findById(input.categoryId)

    if (!category) {
      throw new CategoryNotFoundError()
    }

    const slug = createSlug(input.slug ?? input.name)

    if (!slug) {
      throw new InvalidSlugError()
    }

    const existingProduct = await this.productsRepository.findByStoreIdAndSlug(
      input.storeId,
      slug,
    )

    if (existingProduct) {
      throw new ProductAlreadyExistsError()
    }

    return this.productsRepository.create({
      storeId: input.storeId,
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description ?? null,
      priceInCents: input.priceInCents,
      stock: input.stock ?? 0,
    })
  }

  async uploadImage(input: UploadProductImageInput) {
    await this.storesService.getOwnedStore(input.storeId, input.ownerId)

    const product = await this.productsRepository.findByStoreIdAndId(
      input.storeId,
      input.productId,
    )

    if (!product) {
      throw new ProductNotFoundError()
    }

    const imageUpload = await uploadStoreImage({
      fileBuffer: input.image.buffer,
      path: `${input.storeId}/products/${input.productId}.${getImageExtension(
        input.image.contentType,
      )}`,
      contentType: input.image.contentType,
    })

    return this.productsRepository.updateImageUrl(
      product.id,
      imageUpload.publicUrl,
    )
  }
}

export function toProductResponse(product: Product) {
  return {
    id: product.id,
    storeId: product.storeId,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceInCents: product.priceInCents,
    stock: product.stock,
    imageUrl: product.imageUrl,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
