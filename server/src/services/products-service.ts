import { CategoriesRepository } from '@/repositories/categories-repository'
import type { Product, ProductStatus } from '@/repositories/products-repository'
import { ProductsRepository } from '@/repositories/products-repository'
import type { UserRole } from '@/repositories/users-repository'
import { StoresService } from '@/services/stores-service'
import { getImageExtension } from '@/utils/image-extension'
import type { MultipartImage } from '@/utils/multipart-form'
import { createSlug } from '@/utils/slug'
import { uploadStoreImage } from '@/utils/upload-store-image'
import { uuidv7 } from 'uuidv7'

export type { ProductStatus } from '@/repositories/products-repository'

type CreateProductInput = {
  ownerId: string
  role?: UserRole
  storeId: string
  categoryId: string
  name: string
  slug?: string
  description?: string | null
  priceInCents: number
  stock?: number
  status?: ProductStatus
}

type UpdateProductInput = {
  ownerId: string
  role?: UserRole
  storeId: string
  productId: string
  categoryId?: string
  name?: string
  slug?: string
  description?: string | null
  priceInCents?: number
  stock?: number
  status?: ProductStatus
}

type UploadProductImageInput = {
  ownerId: string
  role?: UserRole
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
    await this.storesService.getOwnedStore(
      input.storeId,
      input.ownerId,
      input.role,
    )

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
      status: input.status ?? 'active',
    })
  }

  async listByStore(ownerId: string, storeId: string, role?: UserRole) {
    await this.storesService.getOwnedStore(storeId, ownerId, role)

    return this.productsRepository.listByStoreId(storeId)
  }

  async update(input: UpdateProductInput) {
    await this.storesService.getOwnedStore(
      input.storeId,
      input.ownerId,
      input.role,
    )

    const product = await this.productsRepository.findByStoreIdAndId(
      input.storeId,
      input.productId,
    )

    if (!product) {
      throw new ProductNotFoundError()
    }

    if (input.categoryId) {
      const category = await this.categoriesRepository.findById(
        input.categoryId,
      )

      if (!category) {
        throw new CategoryNotFoundError()
      }
    }

    const slug =
      input.slug || input.name ? createSlug(input.slug ?? input.name ?? '') : ''

    if (input.slug && !slug) {
      throw new InvalidSlugError()
    }

    if (slug) {
      const existingProduct =
        await this.productsRepository.findByStoreIdAndSlug(input.storeId, slug)

      if (existingProduct && existingProduct.id !== input.productId) {
        throw new ProductAlreadyExistsError()
      }
    }

    const updatedProduct = await this.productsRepository.update(
      input.productId,
      {
        categoryId: input.categoryId,
        name: input.name,
        ...(slug ? { slug } : {}),
        description: input.description,
        priceInCents: input.priceInCents,
        stock: input.stock,
        status: input.status,
      },
    )

    if (!updatedProduct) {
      throw new ProductNotFoundError()
    }

    return updatedProduct
  }

  async updateStatus(input: {
    ownerId: string
    role?: UserRole
    storeId: string
    productId: string
    status: ProductStatus
  }) {
    await this.storesService.getOwnedStore(
      input.storeId,
      input.ownerId,
      input.role,
    )

    const product = await this.productsRepository.findByStoreIdAndId(
      input.storeId,
      input.productId,
    )

    if (!product) {
      throw new ProductNotFoundError()
    }

    const updatedProduct = await this.productsRepository.updateStatus(
      input.productId,
      input.status,
    )

    if (!updatedProduct) {
      throw new ProductNotFoundError()
    }

    return updatedProduct
  }

  async uploadImage(input: UploadProductImageInput) {
    await this.storesService.getOwnedStore(
      input.storeId,
      input.ownerId,
      input.role,
    )

    const product = await this.productsRepository.findByStoreIdAndId(
      input.storeId,
      input.productId,
    )

    if (!product) {
      throw new ProductNotFoundError()
    }

    const imageId = uuidv7()
    const imageUpload = await uploadStoreImage({
      fileBuffer: input.image.buffer,
      path: `${input.storeId}/products/${input.productId}/${imageId}.${getImageExtension(input.image.contentType)}`,
      contentType: input.image.contentType,
    })

    await this.productsRepository.createImage({
      id: imageId,
      productId: product.id,
      path: imageUpload.path,
      imageUrl: imageUpload.publicUrl,
    })

    if (product.imageUrl) {
      return product
    }

    const updatedProduct = await this.productsRepository.updateImageUrl(
      product.id,
      imageUpload.publicUrl,
    )

    if (!updatedProduct) {
      throw new ProductNotFoundError()
    }

    return updatedProduct
  }

  async toResponse(product: Product) {
    const images = await this.productsRepository.listImagesByProductId(
      product.id,
    )

    return toProductResponse(
      product,
      images.map((image) => image.imageUrl),
    )
  }

  async toResponses(products: Product[]) {
    const imageUrlsByProductId = await this.getImageUrlsByProductIds(
      products.map((product) => product.id),
    )

    return products.map((product) =>
      toProductResponse(product, imageUrlsByProductId.get(product.id) ?? []),
    )
  }

  async getImageUrlsByProductIds(productIds: string[]) {
    const images =
      await this.productsRepository.listImagesByProductIds(productIds)
    const imageUrlsByProductId = new Map<string, string[]>()

    for (const image of images) {
      imageUrlsByProductId.set(image.productId, [
        ...(imageUrlsByProductId.get(image.productId) ?? []),
        image.imageUrl,
      ])
    }

    return imageUrlsByProductId
  }
}

export function toProductResponse(product: Product, imageUrls: string[] = []) {
  const responseImageUrls =
    imageUrls.length > 0
      ? imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : []

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
    imageUrls: responseImageUrls,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
