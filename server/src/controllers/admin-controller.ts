import type { FastifyReply, FastifyRequest } from 'fastify'

import { handleSharedError } from '@/controllers/stores-controller'
import type { StoreStatus } from '@/repositories/stores-repository'
import { StoresService, toStoreResponse } from '@/services/stores-service'

type UpdateStoreStatusRequest = FastifyRequest<{
  Params: { storeId: string }
  Body: { status: StoreStatus }
}>

export class AdminController {
  constructor(private readonly storesService = new StoresService()) {}

  updateStoreStatus = async (
    request: UpdateStoreStatusRequest,
    reply: FastifyReply,
  ) => {
    try {
      const store = await this.storesService.updateStatus(
        request.params.storeId,
        request.body.status,
      )

      return reply.status(200).send({ store: toStoreResponse(store) })
    } catch (error) {
      return handleSharedError(error, reply)
    }
  }
}
