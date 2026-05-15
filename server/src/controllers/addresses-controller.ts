import type { FastifyReply, FastifyRequest } from 'fastify'

import { handleSharedError } from '@/controllers/stores-controller'
import {
  AddressesService,
  AddressNotFoundError,
  toAddressResponse,
} from '@/services/addresses-service'

type AddressBody = {
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

type CreateUserAddressRequest = FastifyRequest<{
  Body: AddressBody
}>

type CreateStoreAddressRequest = FastifyRequest<{
  Params: { storeId: string }
  Body: AddressBody
}>

type AddressParamsRequest = FastifyRequest<{
  Params: { addressId: string }
}>

type UpdateUserAddressRequest = FastifyRequest<{
  Params: { addressId: string }
  Body: Partial<AddressBody>
}>

export class AddressesController {
  constructor(private readonly addressesService = new AddressesService()) {}

  listUserAddresses = async (request: FastifyRequest, reply: FastifyReply) => {
    const addresses = await this.addressesService.listUserAddresses(
      request.user.sub,
    )

    return reply.status(200).send({
      addresses: addresses.map(toAddressResponse),
    })
  }

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

  updateUserAddress = async (
    request: UpdateUserAddressRequest,
    reply: FastifyReply,
  ) => {
    try {
      const address = await this.addressesService.updateUserAddress({
        userId: request.user.sub,
        addressId: request.params.addressId,
        ...request.body,
      })

      return reply.status(200).send({
        address: toAddressResponse(address),
      })
    } catch (error) {
      return handleAddressError(error, reply)
    }
  }

  setPrimaryUserAddress = async (
    request: AddressParamsRequest,
    reply: FastifyReply,
  ) => {
    try {
      const address = await this.addressesService.setPrimaryUserAddress({
        userId: request.user.sub,
        addressId: request.params.addressId,
      })

      return reply.status(200).send({
        address: toAddressResponse(address),
      })
    } catch (error) {
      return handleAddressError(error, reply)
    }
  }

  deleteUserAddress = async (
    request: AddressParamsRequest,
    reply: FastifyReply,
  ) => {
    try {
      await this.addressesService.deleteUserAddress({
        userId: request.user.sub,
        addressId: request.params.addressId,
      })

      return reply.status(200).send({ message: 'Address deleted' })
    } catch (error) {
      return handleAddressError(error, reply)
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

function handleAddressError(error: unknown, reply: FastifyReply) {
  if (error instanceof AddressNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  return handleSharedError(error, reply)
}
