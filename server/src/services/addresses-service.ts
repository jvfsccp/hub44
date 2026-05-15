import type { Address } from '@/repositories/addresses-repository'
import { AddressesRepository } from '@/repositories/addresses-repository'
import { StoresService } from '@/services/stores-service'

type AddressInput = {
  recipient?: string | null
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
  isPrimary?: boolean
}

export class AddressNotFoundError extends Error {
  constructor() {
    super('Address not found')
  }
}

export class AddressesService {
  constructor(
    private readonly addressesRepository = new AddressesRepository(),
    private readonly storesService = new StoresService(),
  ) {}

  async listUserAddresses(userId: string) {
    return this.addressesRepository.findByUserId(userId)
  }

  async createUserAddress(input: AddressInput & { userId: string }) {
    if (input.isPrimary) {
      await this.addressesRepository.unsetPrimaryForUser(input.userId)
    }

    return this.addressesRepository.create({
      userId: input.userId,
      storeId: null,
      ...toAddressValues(input),
    })
  }

  async createStoreAddress(
    input: AddressInput & { ownerId: string; storeId: string },
  ) {
    await this.storesService.getOwnedStore(input.storeId, input.ownerId)

    return this.addressesRepository.create({
      userId: null,
      storeId: input.storeId,
      ...toAddressValues(input),
    })
  }

  async updateUserAddress(
    input: Partial<AddressInput> & { userId: string; addressId: string },
  ) {
    const currentAddress = await this.addressesRepository.findByUserIdAndId(
      input.userId,
      input.addressId,
    )

    if (!currentAddress) {
      throw new AddressNotFoundError()
    }

    if (input.isPrimary) {
      await this.addressesRepository.unsetPrimaryForUser(input.userId)
    }

    const address = await this.addressesRepository.update(input.addressId, {
      recipient: input.recipient,
      street: input.street,
      number: input.number,
      complement: input.complement,
      district: input.district,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      isPrimary: input.isPrimary,
    })

    if (!address) {
      throw new AddressNotFoundError()
    }

    return address
  }

  async setPrimaryUserAddress(input: { userId: string; addressId: string }) {
    const currentAddress = await this.addressesRepository.findByUserIdAndId(
      input.userId,
      input.addressId,
    )

    if (!currentAddress) {
      throw new AddressNotFoundError()
    }

    await this.addressesRepository.unsetPrimaryForUser(input.userId)

    const address = await this.addressesRepository.update(input.addressId, {
      isPrimary: true,
    })

    if (!address) {
      throw new AddressNotFoundError()
    }

    return address
  }

  async deleteUserAddress(input: { userId: string; addressId: string }) {
    const currentAddress = await this.addressesRepository.findByUserIdAndId(
      input.userId,
      input.addressId,
    )

    if (!currentAddress) {
      throw new AddressNotFoundError()
    }

    const address = await this.addressesRepository.delete(input.addressId)

    if (!address) {
      throw new AddressNotFoundError()
    }

    return address
  }
}

export function toAddressResponse(address: Address) {
  return {
    id: address.id,
    userId: address.userId,
    storeId: address.storeId,
    recipient: address.recipient,
    street: address.street,
    number: address.number,
    complement: address.complement,
    district: address.district,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    isPrimary: address.isPrimary,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  }
}

function toAddressValues(input: AddressInput) {
  return {
    recipient: input.recipient ?? null,
    street: input.street,
    number: input.number,
    complement: input.complement ?? null,
    district: input.district,
    city: input.city,
    state: input.state,
    zipCode: input.zipCode,
    isPrimary: input.isPrimary ?? false,
  }
}
