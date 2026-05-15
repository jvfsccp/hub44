import type { FastifyReply, FastifyRequest } from 'fastify'

import { handleSharedError } from '@/controllers/stores-controller'
import {
  AddressesService,
  toAddressResponse,
} from '@/services/addresses-service'

type AddressBody = {
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
}

type CreateUserAddressRequest = FastifyRequest<{
  Body: AddressBody
}>

type CreateStoreAddressRequest = FastifyRequest<{
  Params: { storeId: string }
  Body: AddressBody
}>

export class AddressesController {
  constructor(private readonly addressesService = new AddressesService()) {}

  createUserAddress = async (
    request: CreateUserAddressRequest,
    reply: FastifyReply,
  ) => {
    try {
      const address = await this.addressesService.createUserAddress({
        userId: request.user.sub,
        ...request.body,
      })

      return reply.status(201).send({
        address: toAddressResponse(address),
      })
    } catch (error) {
      return handleSharedError(error, reply)
    }
  }

  createStoreAddress = async (
    request: CreateStoreAddressRequest,
    reply: FastifyReply,
  ) => {
    try {
      const address = await this.addressesService.createStoreAddress({
        ownerId: request.user.sub,
        storeId: request.params.storeId,
        ...request.body,
      })

      return reply.status(201).send({
        address: toAddressResponse(address),
      })
    } catch (error) {
      return handleSharedError(error, reply)
    }
  }
}
