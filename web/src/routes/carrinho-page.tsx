import { Link } from '@tanstack/react-router'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type CartItem = {
  id: string
  name: string
  store: string
  variant: string
  quantity: number
  price: number
}

const initialItems: CartItem[] = [
  {
    id: 'item-1',
    name: 'Blazer Alfaiataria Premium',
    store: 'Loja Aurora Fashion',
    variant: 'Areia | Tam M',
    quantity: 2,
    price: 189.9,
  },
  {
    id: 'item-2',
    name: 'Camisa Social Slim',
    store: 'Central Mix Atacado',
    variant: 'Branca | Tam G',
    quantity: 1,
    price: 129.9,
  },
  {
    id: 'item-3',
    name: 'Calca Reta Premium',
    store: 'Moda Centro Norte',
    variant: 'Preta | Tam 42',
    quantity: 3,
    price: 159.9,
  },
]

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function CarrinhoPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [savedItems, setSavedItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState('')

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  )
  const shipping = items.length > 0 ? 24.9 : 0
  const discount = coupon.trim().toUpperCase() === 'HUB44' ? subtotal * 0.1 : 0
  const total = subtotal + shipping - discount

  function increaseQuantity(itemId: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }

  function decreaseQuantity(itemId: string) {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.id !== itemId) return item
        if (item.quantity <= 1) return []
        return { ...item, quantity: item.quantity - 1 }
      }),
    )
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }

  function saveForLater(itemId: string) {
    setItems((current) => {
      const selected = current.find((item) => item.id === itemId)
      if (!selected) return current
      setSavedItems((saved) => [...saved, selected])
      return current.filter((item) => item.id !== itemId)
    })
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Meu carrinho</h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Revise seus itens e finalize o pedido com seguranca.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Produtos no carrinho</CardTitle>
              <CardDescription>{items.length} itens ativos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              {items.length === 0 ? (
                <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center">
                  <ShoppingBag className="mx-auto mb-2 size-6 text-foreground-subtle" />
                  <p className="font-medium text-foreground">Seu carrinho esta vazio</p>
                  <p className="mt-1 text-sm text-foreground-subtle">Adicione produtos para continuar.</p>
                  <Button className="mt-4" variant="secondary" render={<Link to="/marketplace" />}>
                    Continuar comprando
                  </Button>
                </div>
              ) : (
                items.map((item) => {
                  const subtotalItem = item.price * item.quantity
                  return (
                    <article key={item.id} className="rounded-xl bg-surface-alt/70 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="h-22 w-full rounded-xl bg-linear-135 from-primary/25 to-secondary/25 sm:h-20 sm:w-20" />

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="text-sm text-foreground-subtle">{item.store}</p>
                            </div>
                            <Badge variant="outline">{item.variant}</Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-foreground-subtle">Unitario: {currency.format(item.price)}</span>
                            <span className="font-semibold text-foreground">Subtotal: {currency.format(subtotalItem)}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" size="icon-sm" variant="outline" onClick={() => decreaseQuantity(item.id)}>
                              <Minus className="size-4" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <Button type="button" size="icon-sm" variant="outline" onClick={() => increaseQuantity(item.id)}>
                              <Plus className="size-4" />
                            </Button>

                            <Button type="button" size="sm" variant="ghost" onClick={() => saveForLater(item.id)}>
                              Salvar para depois
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                              <Trash2 className="size-4" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })
              )}

              {savedItems.length > 0 ? (
                <div className="rounded-xl bg-surface-alt/70 p-4 text-sm text-foreground-subtle">
                  {savedItems.length} item(ns) salvo(s) para depois.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="h-fit rounded-2xl py-0 lg:sticky lg:top-24">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Resumo do pedido</CardTitle>
              <CardDescription>Valores simulados para checkout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-2 rounded-xl bg-surface-alt/70 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">Subtotal</span>
                  <span className="font-medium text-foreground">{currency.format(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">Frete</span>
                  <span className="font-medium text-foreground">{currency.format(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">Desconto</span>
                  <span className="font-medium text-foreground">-{currency.format(discount)}</span>
                </div>
                <div className="mt-2 border-t border-border/50 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-heading text-xl font-bold text-foreground">{currency.format(total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Cupom de desconto"
                />
                <p className="text-xs text-foreground-subtle">Use HUB44 para simular 10% de desconto.</p>
              </div>

              <Button className="h-11 w-full" disabled={items.length === 0}>
                Ir para pagamento
              </Button>
              <Button variant="secondary" className="h-11 w-full" render={<Link to="/marketplace" />}>
                Continuar comprando
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
