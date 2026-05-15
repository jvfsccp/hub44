import { createRouter } from '@tanstack/react-router'
import {
  cadastroRoute,
  carrinhoRoute,
  cartRoute,
  checkoutRoute,
  clientePedidosRoute,
  customerMarketplaceRoute,
  homeRoute,
  loginRoute,
  lojistaDashboardRoute,
  lojistaLojaRoute,
  lojistaPedidosRoute,
  lojistaPerfilRoute,
  lojistaProdutoNovoRoute,
  lojistaProdutosRoute,
  marketplaceLojasRoute,
  marketplaceProdutosRoute,
  pedidoDetalheRoute,
  pedidoSucessoRoute,
  perfilRoute,
  productDetailsRoute,
  rootRoute,
} from './routes/root-layout.tsx'

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  cadastroRoute,
  clientePedidosRoute,
  pedidoDetalheRoute,
  customerMarketplaceRoute,
  marketplaceLojasRoute,
  marketplaceProdutosRoute,
  productDetailsRoute,
  carrinhoRoute,
  cartRoute,
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
