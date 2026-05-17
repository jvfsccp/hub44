import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Search, ShoppingCart, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'

import productBlazerImage from '@/assets/stitch/product-blazer.png'
import productDressImage from '@/assets/stitch/product-dress.png'
import productSneakerImage from '@/assets/stitch/product-sneaker.png'
import productTshirtImage from '@/assets/stitch/product-tshirt.png'
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiError, getAccessToken } from '@/lib/api'
import { addCartItem, cartQueryKeys } from '@/lib/cart'
import {
  catalogQueryKeys,
  listCategories,
  listProducts,
  listStores,
} from '@/lib/catalog'

const fallbackProductImages = [
  productDressImage,
  productBlazerImage,
  productSneakerImage,
  productTshirtImage,
]
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function MarketplaceProdutosPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const hasToken = Boolean(getAccessToken())
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [stockOnly, setStockOnly] = useState(true)

  const categoriesQuery = useQuery({
    queryKey: catalogQueryKeys.categories,
    queryFn: listCategories,
  })
  const storesQuery = useQuery({
    queryKey: catalogQueryKeys.stores,
    queryFn: listStores,
  })
  const productsQuery = useQuery({
    queryKey: catalogQueryKeys.products({
      categoryId: selectedCategoryId || undefined,
      storeId: selectedStoreId || undefined,
    }),
    queryFn: () =>
      listProducts({
        categoryId: selectedCategoryId || undefined,
        storeId: selectedStoreId || undefined,
      }),
  })
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => addCartItem({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all })
    },
  })

  const products = useMemo(() => {
    const query = search.trim().toLowerCase()

    return (productsQuery.data?.products ?? []).filter((product) => {
      const matchesSearch =
        !query ||
        `${product.name} ${product.storeName} ${product.categoryName}`
          .toLowerCase()
          .includes(query)
      const matchesStock = !stockOnly || product.stock > 0

      return matchesSearch && matchesStock
    })
  }, [productsQuery.data?.products, search, stockOnly])

  function handleAddToCart(productId: string) {
    if (!hasToken) {
      navigate({ to: '/login' })
      return
    }

    addToCartMutation.mutate(productId)
  }

  return (
    <main className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      <MarketplaceHeader
        active="products"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Buscar produto, loja ou categoria...',
        }}
      />

      <section className="mx-auto max-w-screen-2xl px-4 pt-28 pb-12 sm:px-6">
        <div className="rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-10">
          <span className="rounded-full bg-white/12 px-4 py-2 text-xs font-bold tracking-[0.22em] uppercase">
            Catalogo publico
          </span>
          <h1 className="mt-6 max-w-3xl font-heading text-4xl font-bold sm:text-6xl">
            Produtos em destaque das lojas registradas.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">
            Filtre por categoria, loja e disponibilidade para navegar pelo
            catalogo ativo do Hub44.
          </p>
        </div>

        <div className="mt-8 grid gap-4 rounded-3xl bg-white p-4 shadow-sm xl:grid-cols-[1fr_14rem_14rem_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-12 w-full rounded-2xl bg-surface-alt pr-4 pl-11 text-sm outline-none ring-primary/20 transition focus:ring-2"
              placeholder="Buscar produtos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="h-12 rounded-2xl bg-surface-alt px-4 text-sm outline-none ring-primary/20 transition focus:ring-2"
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
          >
            <option value="">Todas categorias</option>
            {(categoriesQuery.data?.categories ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="h-12 rounded-2xl bg-surface-alt px-4 text-sm outline-none ring-primary/20 transition focus:ring-2"
            value={selectedStoreId}
            onChange={(event) => setSelectedStoreId(event.target.value)}
          >
            <option value="">Todas lojas</option>
            {(storesQuery.data?.stores ?? []).map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant={stockOnly ? 'default' : 'outline'}
            className="h-12 rounded-2xl"
            onClick={() => setStockOnly((value) => !value)}
          >
            <SlidersHorizontal className="size-4" />
            Em estoque
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground-subtle">
            {products.length} produto(s) encontrado(s)
          </p>
          {addToCartMutation.error ? (
            <div className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
              {addToCartMutation.error instanceof ApiError
                ? addToCartMutation.error.message
                : 'Nao foi possivel adicionar ao carrinho.'}
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {products.map((product, index) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <Link
                to="/produto/$productId"
                params={{ productId: product.id }}
                className="block aspect-[4/5] overflow-hidden bg-surface-alt"
              >
                <img
                  src={
                    product.imageUrls[0] ??
                    product.imageUrl ??
                    fallbackProductImages[index % fallbackProductImages.length]
                  }
                  alt={product.name}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {product.storeName}
                  </p>
                  <Link
                    to="/produto/$productId"
                    params={{ productId: product.id }}
                    className="mt-2 block font-heading text-lg font-bold text-foreground transition hover:text-primary"
                  >
                    {product.name}
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{product.categoryName}</Badge>
                  <Badge variant={product.stock > 0 ? 'secondary' : 'outline'}>
                    {product.stock > 0
                      ? `${product.stock} em estoque`
                      : 'Sem estoque'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-heading text-xl font-bold text-primary">
                    {currency.format(product.priceInCents / 100)}
                  </span>
                  <Button
                    size="icon"
                    className="rounded-xl"
                    aria-label="Adicionar ao carrinho"
                    disabled={addToCartMutation.isPending || product.stock <= 0}
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <ShoppingCart className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!productsQuery.isLoading && products.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white px-4 py-8 text-center text-sm text-foreground-subtle">
            Nenhum produto encontrado para os filtros atuais.
          </div>
        ) : null}

        {productsQuery.isLoading ? (
          <div className="mt-8 rounded-2xl bg-white px-4 py-8 text-center text-sm text-foreground-subtle">
            Carregando produtos...
          </div>
        ) : null}
      </section>
    </main>
  )
}
