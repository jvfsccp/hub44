import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'

import productBlazerImage from '@/assets/stitch/product-blazer.png'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, getAccessToken } from '@/lib/api'
import {
  type CartItem,
  cartQueryKeys,
  getCart,
  moveCartItemToCart,
  removeCartItem,
  saveCartItemForLater,
  updateCartItem,
} from '@/lib/cart'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function CarrinhoPage() {
  const queryClient = useQueryClient()
  const [coupon, setCoupon] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const hasToken = Boolean(getAccessToken())

  const cartQuery = useQuery({
    queryKey: cartQueryKeys.detail(coupon),
    queryFn: () => getCart(coupon),
    enabled: hasToken,
  })
  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => invalidateCart(),
    onError: handleMutationError,
  })
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => invalidateCart(),
    onError: handleMutationError,
  })
  const saveMutation = useMutation({
    mutationFn: saveCartItemForLater,
    onSuccess: () => invalidateCart(),
    onError: handleMutationError,
  })
  const moveMutation = useMutation({
    mutationFn: moveCartItemToCart,
    onSuccess: () => invalidateCart(),
    onError: handleMutationError,
  })

  const cart = cartQuery.data
  const items = cart?.items ?? []
  const savedItems = cart?.savedItems ?? []
  const summary = cart?.summary ?? {
    itemsCount: 0,
    subtotalInCents: 0,
    shippingInCents: 0,
    discountInCents: 0,
    totalInCents: 0,
    couponCode: null,
  }
  const isMutating =
    updateMutation.isPending ||
    removeMutation.isPending ||
    saveMutation.isPending ||
    moveMutation.isPending

  function invalidateCart() {
    setFeedback(null)
    queryClient.invalidateQueries({ queryKey: cartQueryKeys.all })
  }

  function handleMutationError(error: unknown) {
    setFeedback(
      error instanceof ApiError
        ? error.message
        : 'Nao foi possivel atualizar o carrinho.',
    )
  }

  function changeQuantity(item: CartItem, quantity: number) {
    if (quantity <= 0) {
      removeMutation.mutate(item.id)
      return
    }

    updateMutation.mutate({ cartItemId: item.id, quantity })
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Meu carrinho
          </h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Revise seus itens e finalize o pedido com seguranca.
          </p>
        </header>

        {!hasToken ? (
          <Card className="rounded-2xl py-0">
            <CardContent className="px-5 py-8 text-center">
              <ShoppingBag className="mx-auto mb-3 size-7 text-foreground-subtle" />
              <p className="font-medium text-foreground">
                Entre para acessar seu carrinho.
              </p>
              <Button className="mt-4" render={<Link to="/login" />}>
                Fazer login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Produtos no carrinho</CardTitle>
                <CardDescription>
                  {summary.itemsCount} itens ativos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                {cartQuery.isLoading ? (
                  <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center text-sm text-foreground-subtle">
                    Carregando carrinho...
                  </div>
                ) : null}

                {cartQuery.error ? (
                  <div className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
                    Nao foi possivel carregar o carrinho.
                  </div>
                ) : null}

                {!cartQuery.isLoading && items.length === 0 ? (
                  <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center">
                    <ShoppingBag className="mx-auto mb-2 size-6 text-foreground-subtle" />
                    <p className="font-medium text-foreground">
                      Seu carrinho esta vazio
                    </p>
                    <p className="mt-1 text-sm text-foreground-subtle">
                      Adicione produtos para continuar.
                    </p>
                    <Button
                      className="mt-4"
                      variant="secondary"
                      render={<Link to="/marketplace" />}
                    >
                      Continuar comprando
                    </Button>
                  </div>
                ) : null}

                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    disabled={isMutating}
                    onDecrease={() => changeQuantity(item, item.quantity - 1)}
                    onIncrease={() => changeQuantity(item, item.quantity + 1)}
                    onRemove={() => removeMutation.mutate(item.id)}
                    onSave={() => saveMutation.mutate(item.id)}
                  />
                ))}

                {savedItems.length > 0 ? (
                  <div className="space-y-3 rounded-xl bg-surface-alt/70 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Salvos para depois
                    </p>
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {item.name}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isMutating}
                          onClick={() => moveMutation.mutate(item.id)}
                        >
                          Mover para carrinho
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="h-fit rounded-2xl py-0 lg:sticky lg:top-24">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Resumo do pedido</CardTitle>
                <CardDescription>Valores calculados pela API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                <div className="space-y-2 rounded-xl bg-surface-alt/70 p-3 text-sm">
                  <SummaryRow
                    label="Subtotal"
                    value={summary.subtotalInCents}
                  />
                  <SummaryRow label="Frete" value={summary.shippingInCents} />
                  <SummaryRow
                    label="Desconto"
                    value={-summary.discountInCents}
                  />
                  <div className="mt-2 border-border/50 border-t pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <span className="font-heading text-xl font-bold text-foreground">
                        {currency.format(summary.totalInCents / 100)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value)}
                    placeholder="Cupom de desconto"
                  />
                  <p className="text-xs text-foreground-subtle">
                    Use HUB44 para aplicar 10% de desconto.
                  </p>
                </div>

                {feedback ? (
                  <div className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
                    {feedback}
                  </div>
                ) : null}

                <Button
                  className="h-11 w-full"
                  disabled={items.length === 0}
                  render={<Link to="/checkout" />}
                >
                  Ir para pagamento
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 w-full"
                  render={<Link to="/marketplace" />}
                >
                  Continuar comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </main>
  )
}

function CartItemCard({
  item,
  disabled,
  onDecrease,
  onIncrease,
  onRemove,
  onSave,
}: {
  item: CartItem
  disabled: boolean
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
  onSave: () => void
}) {
  return (
    <article className="rounded-xl bg-surface-alt/70 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <img
          src={item.imageUrl ?? productBlazerImage}
          alt={item.name}
          className="h-22 w-full rounded-xl object-cover sm:h-20 sm:w-20"
        />

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{item.name}</p>
              <p className="text-sm text-foreground-subtle">{item.storeName}</p>
            </div>
            <Badge variant={item.available ? 'outline' : 'secondary'}>
              {item.available ? item.categoryName : 'Indisponivel'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-foreground-subtle">
              Unitario: {currency.format(item.unitPriceInCents / 100)}
            </span>
            <span className="font-semibold text-foreground">
              Subtotal: {currency.format(item.subtotalInCents / 100)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              disabled={disabled}
              onClick={onDecrease}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              disabled={disabled || item.quantity >= item.stock}
              onClick={onIncrease}
            >
              <Plus className="size-4" />
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={onSave}
            >
              Salvar para depois
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={onRemove}
            >
              <Trash2 className="size-4" />
              Remover
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground-subtle">{label}</span>
      <span className="font-medium text-foreground">
        {currency.format(value / 100)}
      </span>
    </div>
  )
}
