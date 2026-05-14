import { uuidv7 } from 'uuidv7'

import type { Product } from '@/repositories/products-repository'
import { ProductsRepository } from '@/repositories/products-repository'
import { StoresRepository } from '@/repositories/stores-repository'
import { getImageExtension } from '@/utils/image-extension'
import type { MultipartImage } from '@/utils/multipart-form'
import { uploadStoreImage } from '@/utils/upload-store-image'

type CreateProductInput = {
  storeId: string
  name: string
  description: string
  priceInCents: number
  image: MultipartImage
}

export class StoreNotFoundError extends Error {
  constructor() {
    super('Store not found')
  }
}

export class ProductsService {
  constructor(
    private readonly productsRepository = new ProductsRepository(),
    private readonly storesRepository = new StoresRepository(),
  ) {}

  async create(input: CreateProductInput) {
    const store = await this.storesRepository.findById(input.storeId)

    if (!store) {
      throw new StoreNotFoundError()
    }

    const productId = uuidv7()
    const imageUpload = await uploadStoreImage({
      fileBuffer: input.image.buffer,
      path: `${input.storeId}/products/${productId}.${getImageExtension(
        input.image.contentType,
      )}`,
      contentType: input.image.contentType,
    })

    return this.productsRepository.create({
      id: productId,
      storeId: input.storeId,
      name: input.name,
      description: input.description,
      priceInCents: input.priceInCents,
      imageUrl: imageUpload.publicUrl,
    })
  }
}

export function toProductResponse(product: Product) {
  return {
    id: product.id,
    storeId: product.storeId,
    name: product.name,
    description: product.description,
    priceInCents: product.priceInCents,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
