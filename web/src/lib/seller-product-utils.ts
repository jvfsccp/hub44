export function parsePriceToCents(value: string) {
  const cleanValue = value.trim().replace(/\s/g, '').replace(/[R$]/g, '')
  const normalized = cleanValue.includes(',')
    ? cleanValue.replace(/\./g, '').replace(',', '.')
    : cleanValue
  const amount = Number(normalized)

  if (!Number.isFinite(amount) || amount <= 0) {
    return null
  }

  return Math.round(amount * 100)
}
