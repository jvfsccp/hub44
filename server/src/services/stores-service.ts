import { uuidv7 } from 'uuidv7'

import type { Store } from '@/repositories/stores-repository'
import { StoresRepository } from '@/repositories/stores-repository'
import { getImageExtension } from '@/utils/image-extension'
import type { MultipartImage } from '@/utils/multipart-form'
import { uploadStoreImage } from '@/utils/upload-store-image'

type CreateStoreInput = {
  name: string
  description: string
  logo: MultipartImage
  banner: MultipartImage
}

export class StoresService {
  constructor(private readonly storesRepository = new StoresRepository()) {}

  async create(input: CreateStoreInput) {
    const storeId = uuidv7()

    const [logoUpload, bannerUpload] = await Promise.all([
      uploadStoreImage({
        fileBuffer: input.logo.buffer,
        path: `${storeId}/logo.${getImageExtension(input.logo.contentType)}`,
        contentType: input.logo.contentType,
      }),
      uploadStoreImage({
        fileBuffer: input.banner.buffer,
        path: `${storeId}/banner.${getImageExtension(input.banner.contentType)}`,
        contentType: input.banner.contentType,
      }),
    ])

    return this.storesRepository.create({
      id: storeId,
      name: input.name,
      description: input.description,
      logoUrl: logoUpload.publicUrl,
      bannerUrl: bannerUpload.publicUrl,
    })
  }
}

export function toStoreResponse(store: Store) {
  return {
    id: store.id,
    name: store.name,
    description: store.description,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
  }
}
