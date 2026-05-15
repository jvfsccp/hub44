import { Kafka, Partitioners } from 'kafkajs'

import { env } from '@/env'

export const kafka = new Kafka({
  clientId: 'hub44-server',
  brokers: [env.KAFKA_BROKER],
})

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
})
export const consumer = kafka.consumer({ groupId: 'hub44-group' })
