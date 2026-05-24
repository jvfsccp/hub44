import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Baby,
  Footprints,
  Headset,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Truck,
  UserCircle,
  Watch,
} from 'lucide-react'
import type { ReactNode } from 'react'

import heroImage from '@/assets/stitch/marketplace-hero.png'
import productBlazerImage from '@/assets/stitch/product-blazer.png'
import productDressImage from '@/assets/stitch/product-dress.png'
import productSneakerImage from '@/assets/stitch/product-sneaker.png'
import productTshirtImage from '@/assets/stitch/product-tshirt.png'
import storeAccessoriesImage from '@/assets/stitch/store-accessories.png'
import storeEleganceImage from '@/assets/stitch/store-elegance.png'
import storeKidsImage from '@/assets/stitch/store-kids.png'
import storeUrbanImage from '@/assets/stitch/store-urban.png'
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header'
import { Button } from '@/components/ui/button'
import { ApiError, getAccessToken, resolveApiAssetUrl } from '@/lib/api'
import { addCartItem, cartQueryKeys } from '@/lib/cart'
import {
  catalogQueryKeys,
  listCategories,
  listProducts,
  listStores,
} from '@/lib/catalog'
import { getProductImageUrls } from '@/lib/product-images'

const categoryIcons = [Shirt, UserCircle, Baby, Footprints, Watch]
const fallbackStoreImages = [
  storeEleganceImage,
  storeUrbanImage,
  storeKidsImage,
  storeAccessoriesImage,
]
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

const footerBenefits = [
  {
    title: 'Entrega em todo Brasil',
    description:
      'Logistica integrada para que suas compras cheguem com seguranca e rapidez.',
    icon: Truck,
  },
  {
    title: 'Compra segura',
    description:
      'Garantimos a entrega ou seu dinheiro de volta. Pagamento processado com criptografia.',
    icon: ShoppingBag,
  },
  {
    title: 'Suporte dedicado',
    description:
      'Atendimento especializado para lojistas e consumidores finais direto pelo WhatsApp.',
    icon: Headset,
  },
]

export function CustomerMarketplacePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const hasToken = Boolean(getAccessToken())

  const categoriesQuery = useQuery({
    queryKey: catalogQueryKeys.categories,
    queryFn: listCategories,
  })
  const storesQuery = useQuery({
    queryKey: catalogQueryKeys.stores,
    queryFn: listStores,
  })
  const productsQuery = useQuery({
    queryKey: catalogQueryKeys.products(),
    queryFn: () => listProducts(),
  })
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) => addCartItem({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all })
    },
  })

  const categories = categoriesQuery.data?.categories ?? []
  const stores = storesQuery.data?.stores ?? []
  const products = productsQuery.data?.products ?? []
  const featuredProducts = products.slice(0, 4)
  const featuredStores = stores.slice(0, 4)

  function handleAddToCart(productId: string) {
    if (!hasToken) {
      navigate({ to: '/login' })
      return
    }

    addToCartMutation.mutate(productId)
  }

  return (
    <main className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      <MarketplaceHeader active="home" />

      <section className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-4 pt-28 pb-12 sm:px-6 lg:grid-cols-12">
        <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-primary lg:col-span-8">
          <img
            src={heroImage}
            alt="Moda atacado Rua 44"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/90 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-8 text-primary-foreground sm:p-12">
            <span className="mb-6 w-fit rounded-full bg-secondary px-4 py-1 text-xs font-bold tracking-[0.22em] text-secondary-foreground uppercase">
              Marketplace Hub44
            </span>
            <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-6xl">
              Compre direto das lojas aprovadas da Rua 44.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/86">
              Uma vitrine central para descobrir lojas, navegar por produtos e
              finalizar compras com carrinho integrado.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                variant="secondary"
                className="h-12 rounded-xl px-6"
                render={<Link to="/marketplace/produtos" />}
              >
                Ver produtos
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/30 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
                render={<Link to="/marketplace/lojas" />}
              >
                Explorar lojas
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:col-span-4">
          <StatCard
            title={`${stores.length} lojas aprovadas`}
            description="Parceiros prontos para vender no catalogo publico."
            to="/marketplace/lojas"
            icon={<Store className="size-4" />}
          />
          <StatCard
            title={`${products.length} produtos ativos`}
            description="Estoque, preco e status sincronizados pela API."
            to="/marketplace/produtos"
            icon={<ShoppingBag className="size-4" />}
            secondary
          />
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.22em] text-secondary uppercase">
              Navegue por estilo
            </span>
            <h2 className="mt-2 font-heading text-4xl font-bold tracking-tight text-primary">
              Categorias para comecar
            </h2>
          </div>
          <Button
            variant="outline"
            render={<Link to="/marketplace/produtos" />}
          >
            Ver catalogo completo
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 5).map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length]

            return (
              <Link
                key={category.id}
                to="/marketplace/produtos"
                className="group aspect-square rounded-3xl border border-border/60 bg-white p-5 text-primary shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="grid h-full place-items-center gap-4">
                  <Icon className="size-12 transition group-hover:scale-110" />
                  <span className="text-center font-heading font-bold">
                    {category.name}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-[#f2f3ff] py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="Parceiros premium"
            title="Lojas em destaque"
            actionLabel="Ver todas as lojas"
            actionTo="/marketplace/lojas"
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredStores.map((store, index) => (
              <article
                key={store.id}
                className="rounded-3xl border border-border/40 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex items-center gap-4">
                  <img
                    src={
                      store.logoUrl
                        ? resolveApiAssetUrl(store.logoUrl)
                        : fallbackStoreImages[
                            index % fallbackStoreImages.length
                          ]
                    }
                    alt={`Logo ${store.name}`}
                    className="size-16 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-primary">
                      {store.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      <Star className="size-4 fill-secondary text-secondary" />
                      <span className="font-bold">Aprovada</span>
                    </div>
                  </div>
                </div>
                <p className="min-h-12 text-sm leading-relaxed text-foreground-subtle">
                  {store.description}
                </p>
                <Button
                  className="mt-6 h-11 w-full rounded-xl"
                  variant="ghost"
                  render={<Link to="/marketplace/produtos" />}
                >
                  Ver produtos
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow="Curadoria Hub44"
          title="Produtos em destaque"
          actionLabel="Abrir catalogo"
          actionTo="/marketplace/produtos"
        />

        {addToCartMutation.error ? (
          <div className="mt-5 rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
            {addToCartMutation.error instanceof ApiError
              ? addToCartMutation.error.message
              : 'Nao foi possivel adicionar ao carrinho.'}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <Link
                to="/produto/$productId"
                params={{ productId: product.id }}
                className="block aspect-[4/5] overflow-hidden bg-surface-alt"
              >
                <img
                  src={
                    getProductImageUrls(
                      product,
                      fallbackProductImages[
                        index % fallbackProductImages.length
                      ],
                    )[0]
                  }
                  alt={product.name}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="p-5">
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
                <div className="mt-4 flex items-center justify-between gap-4">
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
      </section>

      <footer className="border-[#dce3ea] border-t bg-[#f7f9fc]">
        <div className="bg-[#003f75] text-white">
          <div className="mx-auto grid max-w-screen-2xl divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {footerBenefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <div
                  key={benefit.title}
                  className="px-6 py-14 sm:px-8 lg:px-12"
                >
                  <Icon className="mb-6 size-8 text-secondary" />
                  <h3 className="font-heading text-xl font-bold">
                    {benefit.title}
                  </h3>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-blue-100/85">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </footer>
    </main>
  )
}

function StatCard({
  title,
  description,
  to,
  icon,
  secondary = false,
}: {
  title: string
  description: string
  to: '/marketplace/lojas' | '/marketplace/produtos'
  icon: ReactNode
  secondary?: boolean
}) {
  return (
    <div
      className={`overflow-hidden rounded-[2rem] p-8 ${
        secondary
          ? 'bg-[#e2e7ff] text-primary'
          : 'bg-secondary text-secondary-foreground'
      }`}
    >
      <h2 className="font-heading text-3xl font-bold leading-tight">{title}</h2>
      <p className="mt-4 font-medium opacity-80">{description}</p>
      <Link to={to} className="mt-7 inline-flex items-center gap-2 font-bold">
        Abrir {icon}
      </Link>
    </div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  actionLabel,
  actionTo,
}: {
  eyebrow: string
  title: string
  actionLabel: string
  actionTo: '/marketplace/lojas' | '/marketplace/produtos'
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="text-xs font-bold tracking-[0.22em] text-secondary uppercase">
          {eyebrow}
        </span>
        <h2 className="mt-2 font-heading text-4xl font-bold tracking-tight text-primary">
          {title}
        </h2>
      </div>
      <Button
        variant="outline"
        className="h-11 rounded-xl"
        render={<Link to={actionTo} />}
      >
        {actionLabel}
      </Button>
    </div>
  )
}
