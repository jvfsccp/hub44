import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronDown, LogOut, Search, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { getAccessToken } from '@/lib/api'
import { getCurrentUserWithRefresh, logout } from '@/lib/auth'
import { cartQueryKeys, getCart } from '@/lib/cart'

type MarketplaceHeaderProps = {
  active: 'home' | 'stores' | 'products'
  fixed?: boolean
  search?: {
    value: string
    placeholder: string
    onChange: (value: string) => void
  }
}

export function MarketplaceHeader({
  active,
  fixed = true,
  search,
}: MarketplaceHeaderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const hasToken = Boolean(getAccessToken())

  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUserWithRefresh,
    enabled: hasToken,
  })
  const cartQuery = useQuery({
    queryKey: cartQueryKeys.detail(),
    queryFn: () => getCart(),
    enabled: hasToken,
  })
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ['auth'] })
      queryClient.removeQueries({ queryKey: cartQueryKeys.all })
      navigate({ to: '/login' })
    },
  })

  const user = currentUserQuery.data?.user ?? null
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? 'H'
  const cartCount = cartQuery.data?.summary.itemsCount ?? 0

  return (
    <header
      className={`${fixed ? 'fixed' : 'sticky'} top-0 z-50 w-full border-white/50 border-b bg-white/85 shadow-sm backdrop-blur-xl`}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/marketplace"
            className="font-heading text-2xl font-bold tracking-tight text-primary"
          >
            HUB 44
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
            <HeaderLink active={active === 'home'} to="/marketplace">
              Home
            </HeaderLink>
            <HeaderLink active={active === 'stores'} to="/marketplace/lojas">
              Lojas
            </HeaderLink>
            <HeaderLink
              active={active === 'products'}
              to="/marketplace/produtos"
            >
              Produtos
            </HeaderLink>
          </nav>
        </div>

        {search ? (
          <div className="relative hidden max-w-xl flex-1 md:block">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-xl bg-[#f2f3ff] py-3 pr-4 pl-11 text-sm outline-none ring-primary/20 transition focus:ring-2"
              placeholder={search.placeholder}
              type="search"
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
            />
          </div>
        ) : (
          <div className="hidden flex-1 md:block" />
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Carrinho"
            className="relative"
            onClick={() => navigate({ to: hasToken ? '/carrinho' : '/login' })}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 ? (
              <span className="-top-1 -right-1 absolute grid size-5 place-items-center rounded-full bg-secondary text-[0.65rem] font-bold text-secondary-foreground">
                {cartCount}
              </span>
            ) : null}
          </Button>

          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2 rounded-xl bg-white px-2.5 sm:px-3"
              onClick={() => {
                if (!user) {
                  navigate({ to: '/login' })
                  return
                }

                setUserMenuOpen((value) => !value)
              }}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                {userInitial}
              </span>
              <span className="hidden max-w-32 truncate text-left sm:block">
                {user?.name ?? 'Entrar'}
              </span>
              <ChevronDown className="size-4" />
            </Button>

            {userMenuOpen && user ? (
              <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-border/70 bg-white p-3 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)]">
                <div className="rounded-xl bg-surface-alt p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-foreground-subtle">
                    {user.email}
                  </p>
                  {user.phone ? (
                    <p className="mt-1 text-xs text-foreground-subtle">
                      {user.phone}
                    </p>
                  ) : null}
                </div>
                <Link
                  to="/perfil"
                  className="mt-2 block rounded-xl px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Meu perfil
                </Link>
                <Link
                  to="/cliente/pedidos"
                  className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Meus pedidos
                </Link>
                <button
                  type="button"
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-error transition hover:bg-error/10"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="size-4" />
                  Sair da conta
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

function HeaderLink({
  active,
  to,
  children,
}: {
  active: boolean
  to: '/marketplace' | '/marketplace/lojas' | '/marketplace/produtos'
  children: string
}) {
  return (
    <Link
      to={to}
      className={
        active
          ? 'border-primary border-b-2 pb-1 text-primary'
          : 'text-foreground-subtle transition-colors hover:text-primary'
      }
    >
      {children}
    </Link>
  )
}
