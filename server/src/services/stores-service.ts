import type {
  Store,
  StoreImageKind,
  StoreStatus,
} from '@/repositories/stores-repository'
import { StoresRepository } from '@/repositories/stores-repository'
import type { MultipartImage } from '@/utils/multipart-form'
import { createSlug } from '@/utils/slug'
import { uploadStoreImage } from '@/utils/upload-store-image'

export type { StoreImageKind } from '@/repositories/stores-repository'

type CreateStoreInput = {
  ownerId: string
  name: string
  slug?: string
  description: string
  cnpj: string
  phone: string
}

type UploadStoreImageInput = {
  ownerId: string
  storeId: string
  kind: StoreImageKind
  image: MultipartImage
}

export class StoreAlreadyExistsError extends Error {
  constructor(message = 'Store already exists') {
    super(message)
  }
}

export class StoreNotFoundError extends Error {
  constructor() {
    super('Store not found')
  }
}

export class StoreAccessDeniedError extends Error {
  constructor() {
    super('You do not have access to this store')
  }
}

export class InvalidSlugError extends Error {
  constructor() {
    super('Slug must contain at least one letter or number')
  }
}

export class StoresService {
  constructor(private readonly storesRepository = new StoresRepository()) {}

  async getByOwnerId(ownerId: string) {
    return this.storesRepository.findByOwnerId(ownerId)
  }

  async create(input: CreateStoreInput) {
    const slug = createSlug(input.slug ?? input.name)

    if (!slug) {
      throw new InvalidSlugError()
    }

    const existingStoreBySlug = await this.storesRepository.findBySlug(slug)

    if (existingStoreBySlug) {
      throw new StoreAlreadyExistsError('Store slug already exists')
    }

    const existingStoreByCnpj = await this.storesRepository.findByCnpj(
      input.cnpj,
    )

    if (existingStoreByCnpj) {
      throw new StoreAlreadyExistsError('Store CNPJ already exists')
    }

    return this.storesRepository.create({
      ownerId: input.ownerId,
      name: input.name,
      slug,
      description: input.description,
      cnpj: input.cnpj,
      phone: input.phone,
    })
  }

  async getOwnedStore(storeId: string, ownerId: string) {
    const store = await this.storesRepository.findById(storeId)

    if (!store) {
      throw new StoreNotFoundError()
    }

    if (store.ownerId !== ownerId) {
      throw new StoreAccessDeniedError()
    }

    return store
  }

  async updateOwnedStore(
    storeId: string,
    ownerId: string,
    input: Partial<{
      name: string
      slug: string
      description: string
      cnpj: string
      phone: string
    }>,
  ) {
    await this.getOwnedStore(storeId, ownerId)

    const slug = input.slug ? createSlug(input.slug) : undefined

    if (input.slug && !slug) {
      throw new InvalidSlugError()
    }

    if (slug) {
      const existingStoreBySlug = await this.storesRepository.findBySlug(slug)

      if (existingStoreBySlug && existingStoreBySlug.id !== storeId) {
        throw new StoreAlreadyExistsError('Store slug already exists')
      }
    }

    if (input.cnpj) {
      const existingStoreByCnpj = await this.storesRepository.findByCnpj(
        input.cnpj,
      )

      if (existingStoreByCnpj && existingStoreByCnpj.id !== storeId) {
        throw new StoreAlreadyExistsError('Store CNPJ already exists')
      }
    }

    const store = await this.storesRepository.update(storeId, {
      ...input,
      ...(slug ? { slug } : {}),
    })

    if (!store) {
      throw new StoreNotFoundError()
    }

    return store
  }

  async updateStatus(storeId: string, status: StoreStatus) {
    const store = await this.storesRepository.updateStatus(storeId, status)

    if (!store) {
      throw new StoreNotFoundError()
    }

    return store
  }

  async uploadImage(input: UploadStoreImageInput) {
    await this.getOwnedStore(input.storeId, input.ownerId)

    const imageUpload = await uploadStoreImage({
      fileBuffer: input.image.buffer,
      path: `${input.storeId}/${input.kind}`,
      contentType: input.image.contentType,
    })

    const store = await this.storesRepository.updateImageUrl(
      input.storeId,
      input.kind,
      imageUpload.publicUrl,
    )

    if (!store) {
      throw new StoreNotFoundError()
    }

    return store
  }
}

export function toStoreResponse(store: Store) {
  return {
    id: store.id,
    ownerId: store.ownerId,
    name: store.name,
    slug: store.slug,
    description: store.description,
    cnpj: store.cnpj,
    phone: store.phone,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    status: store.status,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  }
}
