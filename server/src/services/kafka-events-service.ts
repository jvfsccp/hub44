import { producer } from '@/lib/kafka'

const topics = {
  orders: 'hub44.orders',
  notifications: 'hub44.notifications',
} as const

let producerConnected = false

type DomainEvent = {
  eventId: string
  eventType: string
  occurredAt: string
  payload: Record<string, unknown>
}

export class KafkaEventPublishError extends Error {
  constructor(message = 'Could not publish Kafka event') {
    super(message)
  }
}

export class KafkaEventsService {
  async publishOrderEvent(event: DomainEvent) {
    await publish(topics.orders, event.eventId, event)
  }

  async publishNotificationEvent(event: DomainEvent) {
    await publish(topics.notifications, event.eventId, event)
  }
}

async function publish(topic: string, key: string, event: DomainEvent) {
  try {
    if (!producerConnected) {
      await producer.connect()
      producerConnected = true
    }

    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(event),
        },
      ],
    })
  } catch (error) {
    producerConnected = false
    throw new KafkaEventPublishError(
      error instanceof Error ? error.message : undefined,
    )
  }
}
