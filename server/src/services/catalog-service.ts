import { CategoriesRepository } from '@/repositories/categories-repository'
import { ProductsRepository } from '@/repositories/products-repository'
import { StoresRepository } from '@/repositories/stores-repository'
import { toCategoryResponse } from '@/services/categories-service'
import { toStoreResponse } from '@/services/stores-service'

export class CatalogService {
  constructor(
    private readonly categoriesRepository = new CategoriesRepository(),
    private readonly storesRepository = new StoresRepository(),
    private readonly productsRepository = new ProductsRepository(),
  ) {}

  async listCategories() {
    const categories = await this.categoriesRepository.list()

    return categories.map(toCategoryResponse)
  }

  async listStores() {
    const stores = await this.storesRepository.listPublic()

    return stores.map(toStoreResponse)
  }

  async listProducts(input: { categoryId?: string; storeId?: string }) {
    const products = await this.productsRepository.listPublic(input)
    const images = await this.productsRepository.listImagesByProductIds(
      products.map((product) => product.id),
    )
    const imageUrlsByProductId = new Map<string, string[]>()

    for (const image of images) {
      imageUrlsByProductId.set(image.productId, [
        ...(imageUrlsByProductId.get(image.productId) ?? []),
        image.imageUrl,
      ])
    }

    return products.map((product) => {
      const imageUrls =
        imageUrlsByProductId.get(product.id) ??
        (product.imageUrl ? [product.imageUrl] : [])

      return {
        id: product.id,
        storeId: product.storeId,
        storeName: product.storeName,
        storeSlug: product.storeSlug,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceInCents: product.priceInCents,
        stock: product.stock,
        imageUrl: product.imageUrl,
        imageUrls,
        status: product.status,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    })
  }
}
