import { createRouter } from '@tanstack/react-router'
import {
  componentsPreviewRoute,
  homeRoute,
  rootRoute,
} from './routes/root-layout.tsx'

const routeTree = rootRoute.addChildren([homeRoute, componentsPreviewRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
