import { createRouter } from '@tanstack/react-router'
import {
  cadastroRoute,
  componentsPreviewRoute,
  homeRoute,
  lojistaDashboardRoute,
  lojistaLojaRoute,
  lojistaPedidosRoute,
  lojistaProdutoNovoRoute,
  loginRoute,
  rootRoute,
} from './routes/root-layout.tsx'

const routeTree = rootRoute.addChildren([
  homeRoute,
  componentsPreviewRoute,
  loginRoute,
  cadastroRoute,
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
