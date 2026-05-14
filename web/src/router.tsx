import { createRouter } from '@tanstack/react-router'
import {
  cadastroRoute,
  carrinhoRoute,
  checkoutRoute,
  clientePedidosRoute,
  componentsPreviewRoute,
  customerMarketplaceRoute,
  homeRoute,
  loginRoute,
  lojistaDashboardRoute,
  lojistaLojaRoute,
  lojistaPerfilRoute,
  lojistaPedidosRoute,
  lojistaProdutosRoute,
  lojistaProdutoNovoRoute,
  pedidoDetalheRoute,
  pedidoSucessoRoute,
  perfilRoute,
  rootRoute,
} from './routes/root-layout.tsx'

const routeTree = rootRoute.addChildren([
  homeRoute,
  componentsPreviewRoute,
  loginRoute,
  cadastroRoute,
  clientePedidosRoute,
  pedidoDetalheRoute,
  customerMarketplaceRoute,
  carrinhoRoute,
  checkoutRoute,
  pedidoSucessoRoute,
  perfilRoute,
  lojistaDashboardRoute,
  lojistaPedidosRoute,
  lojistaProdutosRoute,
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
