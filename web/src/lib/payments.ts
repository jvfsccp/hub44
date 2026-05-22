export type PaymentMethod = 'card' | 'pix'

export type CardPaymentDetails = {
  cardHolderName: string
  cardNumber: string
  expirationMonth: string
  expirationYear: string
  cvv: string
  installments: number
}

export type PixPaymentDetails = {
  payerName: string
  payerDocument: string
}

export type PaymentDetails = {
  card?: CardPaymentDetails
  pix?: PixPaymentDetails
}

export function normalizePaymentDetails(
  method: PaymentMethod,
  details: PaymentDetails,
) {
  if (method === 'card' && details.card) {
    return {
      card: {
        ...details.card,
        cardNumber: onlyDigits(details.card.cardNumber),
        cvv: onlyDigits(details.card.cvv),
        expirationMonth: details.card.expirationMonth.trim(),
        expirationYear: details.card.expirationYear.trim(),
        cardHolderName: details.card.cardHolderName.trim(),
        installments: Number(details.card.installments) || 1,
      },
    }
  }

  if (method === 'pix' && details.pix) {
    return {
      pix: {
        payerName: details.pix.payerName.trim(),
        payerDocument: onlyDigits(details.pix.payerDocument),
      },
    }
  }

  return {}
}

export function validatePaymentDetails(
  method: PaymentMethod,
  details: PaymentDetails,
  now = new Date(),
) {
  if (method === 'card') {
    return validateCardPayment(details.card, now)
  }

  return validatePixPayment(details.pix)
}

function validateCardPayment(
  details: CardPaymentDetails | undefined,
  now: Date,
) {
  if (!details) {
    return 'Preencha os dados do cartao.'
  }

  const cardNumber = onlyDigits(details.cardNumber)
  const cvv = onlyDigits(details.cvv)
  const month = Number(details.expirationMonth)
  const year = normalizeExpirationYear(details.expirationYear)

  if (details.cardHolderName.trim().length < 3) {
    return 'Informe o nome impresso no cartao.'
  }

  if (cardNumber.length < 13 || cardNumber.length > 19) {
    return 'Informe um numero de cartao valido.'
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return 'Informe um mes de vencimento valido.'
  }

  if (!Number.isInteger(year) || isExpired(month, year, now)) {
    return 'Informe uma data de vencimento valida.'
  }

  if (cvv.length < 3 || cvv.length > 4) {
    return 'Informe um CVV valido.'
  }

  if (
    !Number.isInteger(Number(details.installments)) ||
    details.installments < 1 ||
    details.installments > 12
  ) {
    return 'Informe uma quantidade de parcelas entre 1 e 12.'
  }

  return null
}

function validatePixPayment(details: PixPaymentDetails | undefined) {
  if (!details) {
    return 'Preencha os dados do pagador PIX.'
  }

  const documentDigits = onlyDigits(details.payerDocument)

  if (details.payerName.trim().length < 3) {
    return 'Informe o nome do pagador PIX.'
  }

  if (![11, 14].includes(documentDigits.length)) {
    return 'Informe um CPF ou CNPJ valido para o PIX.'
  }

  return null
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function normalizeExpirationYear(value: string) {
  const year = Number(value)

  if (!Number.isInteger(year)) {
    return Number.NaN
  }

  return year < 100 ? 2000 + year : year
}

function isExpired(month: number, year: number, now: Date) {
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  return year < currentYear || (year === currentYear && month < currentMonth)
}
