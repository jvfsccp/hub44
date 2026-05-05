import {
  createRootRoute,
  createRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { LayoutGrid, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CadastroPage } from './cadastro-page.tsx'
import { ClientePedidosPage } from './cliente-pedidos-page.tsx'
import { ComponentsPreviewPage } from './components-preview-page.tsx'
import { CustomerMarketplacePage } from './customer-marketplace-page.tsx'
import { HomePage } from './home-page.tsx'
import { LoginPage } from './login-page.tsx'
import { LojistaDashboardPage } from './lojista-dashboard-page.tsx'
import { LojistaLojaPage } from './lojista-loja-page.tsx'
import { LojistaPedidosPage } from './lojista-pedidos-page.tsx'
import { LojistaProdutoNovoPage } from './lojista-produto-novo-page.tsx'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

export const componentsPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components-preview',
  component: ComponentsPreviewPage,
})

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

export const cadastroRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cadastro',
  component: CadastroPage,
})

export const clientePedidosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cliente/pedidos',
  component: ClientePedidosPage,
export const customerMarketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: CustomerMarketplacePage,
})

export const lojistaDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/dashboard',
  component: LojistaDashboardPage,
})

export const lojistaPedidosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/pedidos',
  component: LojistaPedidosPage,
})

export const lojistaProdutoNovoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/produtos/novo',
  component: LojistaProdutoNovoPage,
})

export const lojistaLojaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lojista/loja',
  component: LojistaLojaPage,
})

function RootLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const shouldShowPublicHeader = pathname !== '/marketplace'

  return (
    <>
      {shouldShowPublicHeader ? (
        <header className="sticky top-0 z-40 px-6 py-4 sm:px-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full bg-surface/80 px-3 py-2 shadow-[0_8px_24px_-10px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-heading text-sm font-semibold text-primary"
            >
              <Sparkles className="size-4" />
              Hub44
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                render={<Link to="/" />}
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
              <Button
                variant="secondary"
                render={<Link to="/components-preview" />}
              >
                <LayoutGrid className="size-4" />
                Components
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
