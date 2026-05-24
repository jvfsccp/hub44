import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Building2, PackageSearch, Search, Store, Tags } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import storeAccessoriesImage from '@/assets/stitch/store-accessories.png'
import storeEleganceImage from '@/assets/stitch/store-elegance.png'
import storeKidsImage from '@/assets/stitch/store-kids.png'
import storeUrbanImage from '@/assets/stitch/store-urban.png'
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { resolveApiAssetUrl } from '@/lib/api'
import { catalogQueryKeys, listProducts, listStores } from '@/lib/catalog'

const fallbackStoreImages = [
  storeEleganceImage,
  storeUrbanImage,
  storeKidsImage,
  storeAccessoriesImage,
]

export function MarketplaceLojasPage() {
  const [search, setSearch] = useState('')
  const [minimumProducts, setMinimumProducts] = useState(0)

  const storesQuery = useQuery({
    queryKey: catalogQueryKeys.stores,
    queryFn: listStores,
  })
  const productsQuery = useQuery({
    queryKey: catalogQueryKeys.products(),
    queryFn: () => listProducts(),
  })

  const productCountByStore = useMemo(() => {
    const counts = new Map<string, number>()

    for (const product of productsQuery.data?.products ?? []) {
      counts.set(product.storeId, (counts.get(product.storeId) ?? 0) + 1)
    }

    return counts
  }, [productsQuery.data?.products])
  const stores = useMemo(() => {
    const query = search.trim().toLowerCase()

    return (storesQuery.data?.stores ?? []).filter((store) => {
      const productCount = productCountByStore.get(store.id) ?? 0
      const matchesSearch =
        !query ||
        `${store.name} ${store.description} ${store.cnpj} ${store.phone}`
          .toLowerCase()
          .includes(query)

      return matchesSearch && productCount >= minimumProducts
    })
  }, [minimumProducts, productCountByStore, search, storesQuery.data?.stores])

  return (
    <main className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      <MarketplaceHeader
        active="stores"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Buscar lojas por nome, CNPJ ou descricao...',
        }}
      />

      <section className="mx-auto max-w-screen-2xl px-4 pt-28 pb-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_0.22fr]">
          <div className="rounded-[2rem] bg-primary p-8 text-primary-foreground sm:p-10">
            <span className="rounded-full bg-white/12 px-4 py-2 text-xs font-bold tracking-[0.22em] uppercase">
              Lojas aprovadas
            </span>
            <h1 className="mt-6 max-w-3xl font-heading text-4xl font-bold sm:text-6xl">
              Encontre parceiros ativos para comprar direto no Hub44.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/85">
              A lista abaixo consome o catalogo publico de lojas aprovadas e
              cruza com produtos ativos para ajudar na descoberta.
            </p>
          </div>

          <Card className="rounded-[2rem] bg-white py-0">
            <CardContent className="grid h-full content-center gap-4 p-6">
              <Metric
                icon={<Store className="size-5" />}
                label="Lojas"
                value={storesQuery.data?.stores.length ?? 0}
              />
              <Metric
                icon={<PackageSearch className="size-5" />}
                label="Produtos ativos"
                value={productsQuery.data?.products.length ?? 0}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 rounded-3xl bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-12 w-full rounded-2xl bg-surface-alt pr-4 pl-11 text-sm outline-none ring-primary/20 transition focus:ring-2"
              placeholder="Buscar lojas"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[0, 1, 5, 10].map((value) => (
              <Button
                key={value}
                type="button"
                variant={minimumProducts === value ? 'default' : 'outline'}
                className="h-10 rounded-xl"
                onClick={() => setMinimumProducts(value)}
              >
                {value === 0 ? 'Todas' : `${value}+ produtos`}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((store, index) => {
            const productCount = productCountByStore.get(store.id) ?? 0
            const imageUrl = store.bannerUrl
              ? resolveApiAssetUrl(store.bannerUrl)
              : store.logoUrl
                ? resolveApiAssetUrl(store.logoUrl)
                : fallbackStoreImages[index % fallbackStoreImages.length]

            return (
              <article
                key={store.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={imageUrl}
                  alt={store.name}
                  className="h-48 w-full object-cover"
                />
                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-primary">
                        {store.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-foreground-subtle">
                        {store.description}
                      </p>
                    </div>
                    <Badge variant="outline">Aprovada</Badge>
                  </div>

                  <div className="grid gap-2 text-sm text-foreground-subtle">
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      CNPJ {store.cnpj}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Tags className="size-4 text-primary" />
                      {productCount} produto(s) ativos
                    </span>
                  </div>

                  <Button
                    className="h-11 w-full rounded-xl"
                    render={<Link to="/marketplace/produtos" />}
                  >
                    Ver produtos da loja
                  </Button>
                </div>
              </article>
            )
          })}
        </div>

        {!storesQuery.isLoading && stores.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white px-4 py-8 text-center text-sm text-foreground-subtle">
            Nenhuma loja encontrada para os filtros atuais.
          </div>
        ) : null}
      </section>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl bg-surface-alt p-4">
      <div className="mb-3 text-primary">{icon}</div>
      <p className="font-heading text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-foreground-subtle">{label}</p>
    </div>
  )
}
