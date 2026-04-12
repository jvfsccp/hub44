import { consumer } from './kafka'

async function startConsumer() {
  await consumer.connect()

  await consumer.subscribe({
    topic: 'hub44.test',
    fromBeginning: true,
  })

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('Mensagem recebida do Kafka:')
      console.log({
        topic,
        partition,
        value: message.value?.toString(),
      })
    },
  })
}

export { startConsumer }