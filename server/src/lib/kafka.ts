import { Kafka } from 'kafkajs'

const kafkaBroker = process.env.KAFKA_BROKER ?? 'localhost:9092'

export const kafka = new Kafka({
  clientId: 'hub44-server',
  brokers: [kafkaBroker],
})

export const producer = kafka.producer()
export const consumer = kafka.consumer({ groupId: 'hub44-group' })
