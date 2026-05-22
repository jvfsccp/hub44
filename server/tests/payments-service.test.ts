import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  PaymentsService,
  PaymentValidationError,
} from '../src/services/payments-service'

test('approves a valid mock card payment', () => {
  const service = new PaymentsService()

  const result = service.process({
    method: 'card',
    amountInCents: 12990,
    details: {
      card: {
        cardHolderName: 'Cliente Hub44',
        cardNumber: '4111 1111 1111 1111',
        expirationMonth: '12',
        expirationYear: '2030',
        cvv: '123',
        installments: 3,
      },
    },
  })

  assert.equal(result.status, 'paid')
  assert.equal(result.provider, 'mock-card')
  assert.equal(result.metadata.cardLastDigits, '1111')
  assert.equal(result.metadata.installments, 3)
})

test('rejects an invalid mock card payment', () => {
  const service = new PaymentsService()

  assert.throws(
    () =>
      service.process({
        method: 'card',
        amountInCents: 12990,
        details: {
          card: {
            cardHolderName: 'A',
            cardNumber: '123',
            expirationMonth: '12',
            expirationYear: '2030',
            cvv: '1',
          },
        },
      }),
    PaymentValidationError,
  )
})

test('approves a valid mock pix payment', () => {
  const service = new PaymentsService()

  const result = service.process({
    method: 'pix',
    amountInCents: 8990,
    details: {
      pix: {
        payerName: 'Cliente Pix',
        payerDocument: '123.456.789-09',
      },
    },
  })

  assert.equal(result.status, 'paid')
  assert.equal(result.provider, 'mock-pix')
  assert.equal(result.metadata.payerDocumentLastDigits, '8909')
})
