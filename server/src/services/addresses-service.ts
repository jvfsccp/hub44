import type { Address } from '@/repositories/addresses-repository'
import { AddressesRepository } from '@/repositories/addresses-repository'
import { StoresService } from '@/services/stores-service'

type AddressInput = {
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
}

export class AddressesService {
  constructor(
    private readonly addressesRepository = new AddressesRepository(),
    private readonly storesService = new StoresService(),
  ) {}

  async createUserAddress(input: AddressInput & { userId: string }) {
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
}

export function toAddressResponse(address: Address) {
  return {
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
  }
}

function toAddressValues(input: AddressInput) {
  return {
    street: input.street,
    number: input.number,
    complement: input.complement ?? null,
    district: input.district,
    city: input.city,
    state: input.state,
    zipCode: input.zipCode,
  }
}
