export function buildProductImageUrls(input: {
  imageUrl?: string | null
  imageUrls?: Array<string | null | undefined>
}) {
  const urls = [input.imageUrl, ...(input.imageUrls ?? [])]
  const uniqueUrls = new Set<string>()

  for (const url of urls) {
    const normalizedUrl = url?.trim()

    if (normalizedUrl) {
      uniqueUrls.add(normalizedUrl)
    }
  }

  return [...uniqueUrls]
}
