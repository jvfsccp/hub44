import {
  createRootRoute,
  createRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Sparkles } from 'lucide-react'

import { MarketplaceHeader } from '@/components/marketplace/marketplace-header'
import { Button } from '@/components/ui/button'
import { getAccessToken } from '@/lib/api'
import { CadastroPage } from './cadastro-page.tsx'
import { CarrinhoPage } from './carrinho-page.tsx'
import { CheckoutPage } from './checkout-page.tsx'
import { ClientePedidosPage } from './cliente-pedidos-page.tsx'
import { CustomerMarketplacePage } from './customer-marketplace-page.tsx'
import { HomePage } from './home-page.tsx'
import { LoginPage } from './login-page.tsx'
import { LojistaDashboardPage } from './lojista-dashboard-page.tsx'
import { LojistaLojaPage } from './lojista-loja-page.tsx'
import { LojistaPedidosPage } from './lojista-pedidos-page.tsx'
import { LojistaPerfilPage } from './lojista-perfil-page.tsx'
import { LojistaProdutoNovoPage } from './lojista-produto-novo-page.tsx'
import { LojistaProdutosPage } from './lojista-produtos-page.tsx'
import { MarketplaceLojasPage } from './marketplace-lojas-page.tsx'
import { MarketplaceProdutosPage } from './marketplace-produtos-page.tsx'
import { PedidoDetalhePage } from './pedido-detalhe-page.tsx'
import { PedidoSucessoPage } from './pedido-sucesso-page.tsx'
import { PerfilPage } from './perfil-page.tsx'
import { ProdutoDetalhePage } from './produto-detalhe-page.tsx'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

function requireAuth() {
  if (!getAccessToken()) {
    throw redirect({ to: '/login' })
  }
}

function redirectAuthenticatedToMarketplace() {
  if (getAccessToken()) {
    throw redirect({ to: '/marketplace' })
  }
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
  beforeLoad: redirectAuthenticatedToMarketplace,
})

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: redirectAuthenticatedToMarketplace,
})

export const cadastroRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cadastro',
  component: CadastroPage,
  beforeLoad: redirectAuthenticatedToMarketplace,
})

export const clientePedidosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cliente/pedidos',
  component: ClientePedidosPage,
  beforeLoad: requireAuth,
})

export const pedidoDetalheRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cliente/pedidos/$pedidoId',
  component: PedidoDetalhePage,
  beforeLoad: requireAuth,
})

export const customerMarketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: CustomerMarketplacePage,
  beforeLoad: requireAuth,
})

export const marketplaceLojasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace/lojas',
  component: MarketplaceLojasPage,
  beforeLoad: requireAuth,
})

export const marketplaceProdutosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace/produtos',
  component: MarketplaceProdutosPage,
  beforeLoad: requireAuth,
})

export const productDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/produto/$productId',
  component: ProdutoDetalhePage,
  beforeLoad: requireAuth,
})

export const carrinhoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carrinho',
  component: CarrinhoPage,
  beforeLoad: requireAuth,
})

export const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CarrinhoPage,
  beforeLoad: requireAuth,
})

export const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
  beforeLoad: requireAuth,
})

export const pedidoSucessoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pedido/sucesso',
  component: PedidoSucessoPage,
  beforeLoad: requireAuth,
})

export const perfilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perfil',
  component: PerfilPage,
  beforeLoad: requireAuth,
})

export const lojistaDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/dashboard',
  component: LojistaDashboardPage,
  beforeLoad: requireAuth,
})

export const lojistaPedidosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/pedidos',
  component: LojistaPedidosPage,
  beforeLoad: requireAuth,
})

export const lojistaProdutosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/produtos',
  component: LojistaProdutosPage,
  beforeLoad: requireAuth,
})

export const lojistaProdutoNovoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/produtos/novo',
  component: LojistaProdutoNovoPage,
  beforeLoad: requireAuth,
})

export const lojistaLojaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/loja',
  component: LojistaLojaPage,
  beforeLoad: requireAuth,
})

export const lojistaPerfilRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/perfil',
  component: LojistaPerfilPage,
  beforeLoad: requireAuth,
})

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isAuthenticated = Boolean(getAccessToken())
  const shouldShowAuthenticatedHeader =
    isAuthenticated && !pathname.startsWith('/marketplace')
  const shouldShowPublicHeader =
    !isAuthenticated && !pathname.startsWith('/marketplace')

  return (
    <>
      {shouldShowAuthenticatedHeader ? (
        <MarketplaceHeader active="home" fixed={false} />
      ) : null}

      {shouldShowPublicHeader ? (
        <header className="sticky top-0 z-40 px-6 py-4 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full bg-surface/80 px-3 py-2 shadow-[0_8px_24px_-10px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <Link
              to={isAuthenticated ? '/marketplace' : '/'}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-heading text-sm font-semibold text-primary"
            >
              <Sparkles className="size-4" />
              Hub44
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                render={<Link to={isAuthenticated ? '/marketplace' : '/'} />}
              >
                Inicio
              </Button>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                render={<Link to="/login" />}
              >
                Entrar
              </Button>
            </div>
          </div>
        </header>
      ) : null}

      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
