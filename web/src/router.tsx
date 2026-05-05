import { createRouter } from '@tanstack/react-router'
import {
  cadastroRoute,
  componentsPreviewRoute,
  customerMarketplaceRoute,
  homeRoute,
  loginRoute,
  lojistaDashboardRoute,
  lojistaLojaRoute,
  lojistaPedidosRoute,
  lojistaProdutoNovoRoute,
  rootRoute,
} from './routes/root-layout.tsx'

const routeTree = rootRoute.addChildren([
  homeRoute,
  componentsPreviewRoute,
  loginRoute,
  cadastroRoute,
  customerMarketplaceRoute,
  lojistaDashboardRoute,
  lojistaPedidosRoute,
  lojistaProdutoNovoRoute,
  lojistaLojaRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
