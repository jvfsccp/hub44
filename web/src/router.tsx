import { createRouter } from '@tanstack/react-router'
import {
  cadastroRoute,
  carrinhoRoute,
  clientePedidosRoute,
  componentsPreviewRoute,
  customerMarketplaceRoute,
  homeRoute,
  loginRoute,
  lojistaDashboardRoute,
  lojistaLojaRoute,
  lojistaPerfilRoute,
  lojistaPedidosRoute,
  lojistaProdutoNovoRoute,
  perfilRoute,
  rootRoute,
} from './routes/root-layout.tsx'

const routeTree = rootRoute.addChildren([
  homeRoute,
  componentsPreviewRoute,
  loginRoute,
  cadastroRoute,
  clientePedidosRoute,
  customerMarketplaceRoute,
  carrinhoRoute,
  perfilRoute,
  lojistaDashboardRoute,
  lojistaPedidosRoute,
  lojistaProdutoNovoRoute,
  lojistaLojaRoute,
  lojistaPerfilRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
