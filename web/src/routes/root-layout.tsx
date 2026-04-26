import { Outlet, createRootRoute, createRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ComponentsPreviewPage } from './components-preview-page.tsx'
import { HomePage } from './home-page.tsx'

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

function RootLayout() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
