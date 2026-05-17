import type { Address } from '@/repositories/addresses-repository'
import { AddressesRepository } from '@/repositories/addresses-repository'
import type { User } from '@/repositories/users-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { UserNotFoundError } from '@/services/auth-service'
import {
  StoreAlreadyExistsError,
  type StoreImageKind,
  StoreNotFoundError,
  StoresService,
} from '@/services/stores-service'
import type { MultipartImage } from '@/utils/multipart-form'

type AddressInput = {
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
}

type OnboardSellerInput = {
  userId: string
  store: {
    name: string
    slug?: string
    description: string
    cnpj: string
    phone: string
  }
  address: AddressInput
}

export class SellerService {
  constructor(
    private readonly storesService = new StoresService(),
    private readonly addressesRepository = new AddressesRepository(),
    private readonly usersRepository = new UsersRepository(),
  ) {}

  async onboard(input: OnboardSellerInput) {
    const existingStore = await this.storesService.getByOwnerId(input.userId)

    if (existingStore) {
      throw new StoreAlreadyExistsError('User already has a store')
    }

    const store = await this.storesService.create({
      ownerId: input.userId,
      ...input.store,
    })

    const address = await this.addressesRepository.create({
      userId: null,
      storeId: store.id,
      ...input.address,
      complement: input.address.complement ?? null,
    })

    const currentUser = await this.usersRepository.findById(input.userId)

    if (!currentUser) {
      throw new UserNotFoundError()
    }

    const user =
      currentUser.role === 'admin'
        ? currentUser
        : await this.usersRepository.updateRole(input.userId, 'seller')

    if (!user) {
      throw new UserNotFoundError()
    }

    return { store, address, user }
  }

  async getStore(ownerId: string) {
    const store = await this.storesService.getByOwnerId(ownerId)

    if (!store) {
      throw new StoreNotFoundError()
    }

    const addresses = await this.addressesRepository.findByStoreId(store.id)

    return { store, addresses }
  }

  async updateStore(
    ownerId: string,
    input: Partial<{
      name: string
      slug: string
      description: string
      cnpj: string
      phone: string
    }>,
  ) {
    const current = await this.storesService.getByOwnerId(ownerId)

    if (!current) {
      throw new StoreNotFoundError()
    }

    const store = await this.storesService.updateOwnedStore(
      current.id,
      ownerId,
      input,
    )
    const addresses = await this.addressesRepository.findByStoreId(store.id)

    return { store, addresses }
  }

  async uploadStoreImage(
    ownerId: string,
    kind: StoreImageKind,
    image: MultipartImage,
  ) {
    const current = await this.storesService.getByOwnerId(ownerId)

    if (!current) {
      throw new StoreNotFoundError()
    }

    return this.storesService.uploadImage({
      ownerId,
      storeId: current.id,
      kind,
      image,
    })
  }
}

export function toSellerUserResponse(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}

export function toSellerStoreAddressesResponse(addresses: Address[]) {
  return addresses.map((address) => ({
    id: address.id,
    userId: address.userId,
    storeId: address.storeId,
    street: address.street,
    number: address.number,
    complement: address.complement,
    district: address.district,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  }))
}
