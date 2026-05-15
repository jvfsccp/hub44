import type { FastifyReply, FastifyRequest } from 'fastify'

import { handleSharedError } from '@/controllers/stores-controller'
import {
  SellerService,
  toSellerStoreAddressesResponse,
  toSellerUserResponse,
} from '@/services/seller-service'
import {
  InvalidSlugError,
  StoreAlreadyExistsError,
  toStoreResponse,
} from '@/services/stores-service'
import type { AuthTokenPayload } from '@/types/auth'

const accessTokenMaxAge = '15m'

type AddressBody = {
  street: string
  number: string
  complement?: string | null
  district: string
  city: string
  state: string
  zipCode: string
}

type OnboardSellerRequest = FastifyRequest<{
  Body: {
    store: {
      name: string
      slug?: string
      description: string
      cnpj: string
      phone: string
    }
    address: AddressBody
  }
}>

type UpdateSellerStoreRequest = FastifyRequest<{
  Body: Partial<{
    name: string
    slug: string
    description: string
    cnpj: string
    phone: string
  }>
}>

export class SellerController {
  constructor(private readonly sellerService = new SellerService()) {}

  onboard = async (request: OnboardSellerRequest, reply: FastifyReply) => {
    try {
      const result = await this.sellerService.onboard({
        userId: request.user.sub,
        store: request.body.store,
        address: request.body.address,
      })
      const user = toSellerUserResponse(result.user)
      const accessToken = await reply.jwtSign(createTokenPayload(user), {
        expiresIn: accessTokenMaxAge,
      })

      return reply.status(201).send({
        store: toStoreResponse(result.store),
        address: toSellerStoreAddressesResponse([result.address])[0],
        user,
        accessToken,
      })
    } catch (error) {
      return handleSellerError(error, reply)
    }
  }

  getStore = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await this.sellerService.getStore(request.user.sub)

      return reply.status(200).send({
        store: toStoreResponse(result.store),
        addresses: toSellerStoreAddressesResponse(result.addresses),
      })
    } catch (error) {
      return handleSellerError(error, reply)
    }
  }

  updateStore = async (
    request: UpdateSellerStoreRequest,
    reply: FastifyReply,
  ) => {
    try {
      const result = await this.sellerService.updateStore(
        request.user.sub,
        request.body,
      )

      return reply.status(200).send({
        store: toStoreResponse(result.store),
        addresses: toSellerStoreAddressesResponse(result.addresses),
      })
    } catch (error) {
      return handleSellerError(error, reply)
    }
  }
}

function handleSellerError(error: unknown, reply: FastifyReply) {
  if (error instanceof StoreAlreadyExistsError) {
    return reply.status(409).send({ message: error.message })
  }

  if (error instanceof InvalidSlugError) {
    return reply.status(400).send({ message: error.message })
  }

  return handleSharedError(error, reply)
}

function createTokenPayload(user: {
  id: string
  name: string
  email: string
  phone: string | null
  role: AuthTokenPayload['role']
}): AuthTokenPayload {
  return {
    sub: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}
