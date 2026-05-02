import { createRouter } from '@tanstack/react-router'
import {
  cadastroRoute,
  clientePedidosRoute,
  componentsPreviewRoute,
  homeRoute,
  loginRoute,
  rootRoute,
} from './routes/root-layout.tsx'

const routeTree = rootRoute.addChildren([
  homeRoute,
  componentsPreviewRoute,
  loginRoute,
  cadastroRoute,
  clientePedidosRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
