import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  normalizePaymentDetails,
  validatePaymentDetails,
} from '../src/lib/payments.ts'

test('normalizes card payment fields before sending checkout', () => {
  const details = normalizePaymentDetails('card', {
    card: {
      cardHolderName: ' Cliente Hub44 ',
      cardNumber: '4111 1111 1111 1111',
      expirationMonth: ' 12 ',
      expirationYear: ' 2030 ',
      cvv: ' 123 ',
      installments: 2,
    },
  })

  assert.deepEqual(details, {
    card: {
      cardHolderName: 'Cliente Hub44',
      cardNumber: '4111111111111111',
      expirationMonth: '12',
      expirationYear: '2030',
      cvv: '123',
      installments: 2,
    },
  })
})

test('validates card expiration against a reference date', () => {
  const message = validatePaymentDetails(
    'card',
    {
      card: {
        cardHolderName: 'Cliente Hub44',
        cardNumber: '4111111111111111',
        expirationMonth: '01',
        expirationYear: '2025',
        cvv: '123',
        installments: 1,
      },
    },
    new Date('2026-05-22T12:00:00Z'),
  )

  assert.equal(message, 'Informe uma data de vencimento valida.')
})

test('accepts valid pix payer data', () => {
  const message = validatePaymentDetails('pix', {
    pix: {
      payerName: 'Cliente Pix',
      payerDocument: '123.456.789-09',
    },
  })

  assert.equal(message, null)
})
