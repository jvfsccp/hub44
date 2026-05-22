import type { Product } from '@/lib/catalog'

export function getProductImageUrls(
  product: Pick<Product, 'imageUrl' | 'imageUrls'> | null | undefined,
  fallbackUrl: string,
) {
  if (!product) {
    return [fallbackUrl]
  }

  const urls = [product.imageUrl, ...product.imageUrls]
  const uniqueUrls = new Set<string>()

  for (const url of urls) {
    const normalizedUrl = url?.trim()

    if (normalizedUrl) {
      uniqueUrls.add(normalizedUrl)
    }
  }

  return uniqueUrls.size > 0 ? [...uniqueUrls] : [fallbackUrl]
}
