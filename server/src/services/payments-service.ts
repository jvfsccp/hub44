import { uuidv7 } from 'uuidv7'

export type SupportedPaymentMethod = 'card' | 'pix'

export type CardPaymentDetails = {
  cardHolderName: string
  cardNumber: string
  expirationMonth: string | number
  expirationYear: string | number
  cvv: string
  installments?: number
}

export type PixPaymentDetails = {
  payerName: string
  payerDocument: string
}

export type PaymentDetails = {
  card?: CardPaymentDetails
  pix?: PixPaymentDetails
}

type ProcessPaymentInput = {
  method: SupportedPaymentMethod
  amountInCents: number
  details?: PaymentDetails
}

export type MockPaymentResult = {
  status: 'paid'
  transactionId: string
  provider: 'mock-card' | 'mock-pix'
  metadata: Record<string, unknown>
}

export class PaymentValidationError extends Error {}

export class PaymentsService {
  process(input: ProcessPaymentInput): MockPaymentResult {
    if (!Number.isInteger(input.amountInCents) || input.amountInCents <= 0) {
      throw new PaymentValidationError('Payment amount must be positive')
    }

    if (input.method === 'card') {
      return this.processCardPayment(input.amountInCents, input.details?.card)
    }

    return this.processPixPayment(input.amountInCents, input.details?.pix)
  }

  private processCardPayment(
    amountInCents: number,
    details: CardPaymentDetails | undefined,
  ): MockPaymentResult {
    if (!details) {
      throw new PaymentValidationError('Card payment details are required')
    }

    const cardHolderName = details.cardHolderName.trim()
    const cardNumberDigits = onlyDigits(details.cardNumber)
    const cvvDigits = onlyDigits(details.cvv)
    const expirationMonth = Number(details.expirationMonth)
    const expirationYear = normalizeExpirationYear(details.expirationYear)
    const installments = details.installments ?? 1

    if (cardHolderName.length < 3) {
      throw new PaymentValidationError('Card holder name is required')
    }

    if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      throw new PaymentValidationError('Card number must have 13 to 19 digits')
    }

    if (
      !Number.isInteger(expirationMonth) ||
      expirationMonth < 1 ||
      expirationMonth > 12
    ) {
      throw new PaymentValidationError('Card expiration month is invalid')
    }

    if (
      !Number.isInteger(expirationYear) ||
      isExpired(expirationMonth, expirationYear)
    ) {
      throw new PaymentValidationError('Card expiration date is invalid')
    }

    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      throw new PaymentValidationError('Card CVV must have 3 or 4 digits')
    }

    if (
      !Number.isInteger(installments) ||
      installments < 1 ||
      installments > 12
    ) {
      throw new PaymentValidationError('Installments must be between 1 and 12')
    }

    return {
      status: 'paid',
      transactionId: `mock_card_${uuidv7()}`,
      provider: 'mock-card',
      metadata: {
        amountInCents,
        cardLastDigits: cardNumberDigits.slice(-4),
        installments,
      },
    }
  }

  private processPixPayment(
    amountInCents: number,
    details: PixPaymentDetails | undefined,
  ): MockPaymentResult {
    if (!details) {
      throw new PaymentValidationError('Pix payment details are required')
    }

    const payerName = details.payerName.trim()
    const payerDocumentDigits = onlyDigits(details.payerDocument)

    if (payerName.length < 3) {
      throw new PaymentValidationError('Pix payer name is required')
    }

    if (![11, 14].includes(payerDocumentDigits.length)) {
      throw new PaymentValidationError(
        'Pix payer document must be a CPF or CNPJ',
      )
    }

    const transactionId = `mock_pix_${uuidv7()}`

    return {
      status: 'paid',
      transactionId,
      provider: 'mock-pix',
      metadata: {
        amountInCents,
        payerDocumentLastDigits: payerDocumentDigits.slice(-4),
        qrCodePayload: `pix://hub44/${transactionId}`,
      },
    }
  }
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function normalizeExpirationYear(value: string | number) {
  const year = Number(value)

  if (!Number.isInteger(year)) {
    return Number.NaN
  }

  return year < 100 ? 2000 + year : year
}

function isExpired(month: number, year: number) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  return year < currentYear || (year === currentYear && month < currentMonth)
}
