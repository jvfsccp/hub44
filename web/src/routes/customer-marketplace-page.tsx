import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Baby,
  ChevronDown,
  Footprints,
  Globe2,
  Headset,
  LogOut,
  Mail,
  Search,
  Share2,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Truck,
  UserCircle,
  Watch,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import heroImage from '@/assets/stitch/marketplace-hero.png'
import productBlazerImage from '@/assets/stitch/product-blazer.png'
import productDressImage from '@/assets/stitch/product-dress.png'
import productSneakerImage from '@/assets/stitch/product-sneaker.png'
import productTshirtImage from '@/assets/stitch/product-tshirt.png'
import storeAccessoriesImage from '@/assets/stitch/store-accessories.png'
import storeEleganceImage from '@/assets/stitch/store-elegance.png'
import storeKidsImage from '@/assets/stitch/store-kids.png'
import storeUrbanImage from '@/assets/stitch/store-urban.png'
import { Button } from '@/components/ui/button'
import { getCurrentUserWithRefresh, logout } from '@/lib/auth'

const categories = [
  { label: 'Moda Feminina', icon: Shirt },
  { label: 'Moda Masculina', icon: UserCircle },
  { label: 'Infantil', icon: Baby },
  { label: 'Calcados', icon: Footprints },
  { label: 'Acessorios', icon: Watch },
]

const stores = [
  {
    name: 'Elegance Rua 44',
    image: storeEleganceImage,
    rating: '4.9',
    reviews: '1.2k',
    description:
      'Especialista em moda festa e alfaiataria premium para o atacado nacional.',
    tags: ['Atacado', 'Alfaiataria'],
  },
  {
    name: 'Urban Style 44',
    image: storeUrbanImage,
    rating: '4.8',
    reviews: '850',
    description:
      'Referencia em streetwear e moda casual masculina com envio imediato.',
    tags: ['Masculino', 'Streetwear'],
  },
  {
    name: 'Kids Premium',
    image: storeKidsImage,
    rating: '4.7',
    reviews: '640',
    description:
      'Linha infantil confortável, colorida e pronta para revenda em volume.',
    tags: ['Infantil', 'Conforto'],
  },
  {
    name: 'Acessorios Capital',
    image: storeAccessoriesImage,
    rating: '4.9',
    reviews: '980',
    description:
      'Bolsas, bijuterias e complementos com curadoria premium da Rua 44.',
    tags: ['Acessorios', 'Premium'],
  },
]

const products = [
  {
    name: 'Vestido Midi Solar',
    store: 'Elegance Rua 44',
    price: 'R$ 149,90',
    image: productDressImage,
  },
  {
    name: 'Blazer Urbano Navy',
    store: 'Urban Style 44',
    price: 'R$ 219,90',
    image: productBlazerImage,
  },
  {
    name: 'Tenis Runner Vermelho',
    store: 'Passo 44',
    price: 'R$ 189,90',
    image: productSneakerImage,
  },
  {
    name: 'Kit Camisetas Neutras',
    store: 'Basic Supply',
    price: 'R$ 89,90',
    image: productTshirtImage,
  },
]

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
    icon: ShieldCheck,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUserWithRefresh,
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['auth'] })
      navigate({ to: '/login' })
    },
  })

  useEffect(() => {
    if (currentUserQuery.isError) {
      navigate({ to: '/login' })
    }
  }, [currentUserQuery.isError, navigate])

  const user = currentUserQuery.data?.user
  const userInitial = user?.name.trim().charAt(0).toUpperCase() ?? 'H'

  return (
    <main className="min-h-screen bg-[#faf8ff] text-[#131b2e]">
      <header className="fixed top-0 z-50 w-full border-b border-white/50 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              to="/marketplace"
              className="font-heading text-2xl font-bold tracking-tight text-primary"
            >
              HUB 44
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
              <a
                className="border-primary border-b-2 pb-1 text-primary"
                href="#browse"
              >
                Navegar
              </a>
              <a
                className="text-foreground-subtle transition-colors hover:text-primary"
                href="#novidades"
              >
                Novidades
              </a>
              <a
                className="text-foreground-subtle transition-colors hover:text-primary"
                href="#ofertas"
              >
                Ofertas
              </a>
              <a
                className="text-foreground-subtle transition-colors hover:text-primary"
                href="#lojista"
              >
                Cadastrar loja
              </a>
            </nav>
          </div>

          <div className="relative hidden max-w-xl flex-1 md:block">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-xl bg-[#f2f3ff] py-3 pr-4 pl-11 text-sm outline-none ring-primary/20 transition focus:ring-2"
              placeholder="Buscar por lojas ou produtos no atacado..."
              type="search"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" aria-label="Carrinho">
              <ShoppingCart className="size-5" />
            </Button>

            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-2 rounded-xl bg-white px-2.5 sm:px-3"
                onClick={() => setUserMenuOpen((value) => !value)}
              >
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  {userInitial}
                </span>
                <span className="hidden max-w-32 truncate text-left sm:block">
                  {user?.name ?? 'Minha conta'}
                </span>
                <ChevronDown className="size-4" />
              </Button>

              {userMenuOpen ? (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-border/70 bg-white p-3 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)]">
                  <div className="rounded-xl bg-surface-alt p-3">
                    <p className="text-sm font-semibold text-foreground">
                      {user?.name ?? 'Carregando usuario...'}
                    </p>
                    <p className="mt-1 truncate text-xs text-foreground-subtle">
                      {user?.email ?? 'Sincronizando dados da conta'}
                    </p>
                    {user?.phone ? (
                      <p className="mt-1 text-xs text-foreground-subtle">
                        {user.phone}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-error transition hover:bg-error/10"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="size-4" />
                    Sair da conta
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

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
              Exclusivo Rua 44
            </span>
            <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-6xl">
              Novidades da Rua 44: o coração da moda nacional.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/86">
              A maior variedade em confeccoes para o seu negocio ou
              guarda-roupa, direto da fonte com preços competitivos.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="secondary" className="h-12 rounded-xl px-6">
                Ver novidades
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/30 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
              >
                Catalogo atacado
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:col-span-4">
          <div className="overflow-hidden rounded-[2rem] bg-secondary p-8 text-secondary-foreground">
            <h2 className="font-heading text-3xl font-bold leading-tight">
              Melhores preços no atacado
            </h2>
            <p className="mt-4 font-medium opacity-80">
              Condições exclusivas para revendedores cadastrados.
            </p>
            <a
              className="mt-7 inline-flex items-center gap-2 font-bold"
              href="#lojista"
            >
              Saiba mais <Store className="size-4" />
            </a>
          </div>

          <div className="rounded-[2rem] bg-[#e2e7ff] p-8">
            <h2 className="font-heading text-3xl font-bold leading-tight text-primary">
              Varejo consciente
            </h2>
            <p className="mt-4 font-medium text-foreground-subtle">
              Peças selecionadas com o melhor custo-beneficio para voce.
            </p>
            <a
              className="mt-7 inline-flex items-center gap-2 font-bold text-primary"
              href="#produtos"
            >
              Explorar varejo <ShoppingBag className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section
        id="browse"
        className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6"
      >
        <span className="text-xs font-bold tracking-[0.22em] text-secondary uppercase">
          Navegue por estilo
        </span>
        <h2 className="mt-2 font-heading text-4xl font-bold tracking-tight text-primary">
          Categorias em destaque
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon

            return (
              <button
                key={category.label}
                type="button"
                className="group aspect-square rounded-3xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="grid h-full place-items-center gap-4 text-primary">
                  <Icon className="size-12 transition group-hover:scale-110" />
                  <span className="font-heading font-bold">
                    {category.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="bg-[#f2f3ff] py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.22em] text-secondary uppercase">
                Parceiros premium
              </span>
              <h2 className="mt-2 font-heading text-4xl font-bold tracking-tight text-primary">
                Lojas em destaque
              </h2>
            </div>
            <a className="font-bold text-primary" href="#stores">
              Ver todos os parceiros
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stores.map((store) => (
              <article
                key={store.name}
                className="rounded-3xl border border-border/40 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex items-center gap-4">
                  <img
                    src={store.image}
                    alt={`Logo ${store.name}`}
                    className="size-16 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-primary">
                      {store.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      <Star className="size-4 fill-secondary text-secondary" />
                      <span className="font-bold">{store.rating}</span>
                      <span className="text-muted-foreground">
                        ({store.reviews})
                      </span>
                    </div>
                  </div>
                </div>
                <p className="min-h-12 text-sm leading-relaxed text-foreground-subtle">
                  {store.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {store.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-alt px-3 py-1 text-[10px] font-bold tracking-wide text-primary uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Button className="mt-6 h-11 w-full rounded-xl" variant="ghost">
                  Visitar loja
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="produtos"
        className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.22em] text-secondary uppercase">
              Curadoria Hub44
            </span>
            <h2 className="mt-2 font-heading text-4xl font-bold tracking-tight text-primary">
              Produtos em alta
            </h2>
          </div>
          <Button variant="outline" className="h-11 rounded-xl">
            Explorar catalogo
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.name}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <div className="aspect-[4/5] overflow-hidden bg-surface-alt">
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {product.store}
                </p>
                <h3 className="mt-2 font-heading text-lg font-bold text-foreground">
                  {product.name}
                </h3>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="font-heading text-xl font-bold text-primary">
                    {product.price}
                  </span>
                  <Button
                    size="icon"
                    className="rounded-xl"
                    aria-label="Adicionar ao carrinho"
                  >
                    <ShoppingCart className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#dce3ea] bg-[#f7f9fc]">
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

        <div className="mx-auto grid max-w-screen-2xl gap-10 px-6 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.35fr] lg:px-12">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              HUB 44
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Conectando o maior polo de moda do Brasil ao mundo. A melhor
              experiencia em compras no atacado e varejo da Rua 44, Goiania.
            </p>
            <div className="mt-7 flex items-center gap-4 text-slate-400">
              <Globe2 className="size-5" />
              <Share2 className="size-5" />
              <Mail className="size-5" />
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-primary">
              Marketplace
            </h3>
            <nav className="mt-5 grid gap-3 text-sm font-semibold text-slate-500">
              <a href="#browse" className="transition hover:text-primary">
                Navegar
              </a>
              <a href="#novidades" className="transition hover:text-primary">
                Novidades
              </a>
              <a href="#ofertas" className="transition hover:text-primary">
                Ofertas
              </a>
              <a href="#sobre" className="transition hover:text-primary">
                Sobre a Rua 44
              </a>
            </nav>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-primary">
              Institucional
            </h3>
            <nav className="mt-5 grid gap-3 text-sm font-semibold text-slate-500">
              <a href="#lojista" className="transition hover:text-primary">
                Termos para lojistas
              </a>
              <a href="#suporte" className="transition hover:text-primary">
                Suporte ao cliente
              </a>
              <a href="#entrega" className="transition hover:text-primary">
                Entrega regional
              </a>
              <a href="#privacidade" className="transition hover:text-primary">
                Politica de privacidade
              </a>
            </nav>
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-primary">
              Newsletter
            </h3>
            <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-slate-500">
              Receba ofertas exclusivas e tendencias diretamente no seu e-mail.
            </p>
            <form className="mt-5 flex gap-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="min-w-0 flex-1 rounded-lg border border-input bg-white px-4 py-2.5 text-sm outline-none ring-primary/20 transition focus:ring-2"
              />
              <Button type="submit" className="h-10 rounded-lg px-4">
                OK
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-[#dce3ea] px-6 py-6 text-center text-sm font-medium text-slate-500">
          © 2026 HUB 44 Marketplace. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  )
}
