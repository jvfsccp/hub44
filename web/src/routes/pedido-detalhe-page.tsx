import { Link, useParams } from '@tanstack/react-router'
import { CheckCircle2, Circle, Headset, PackageCheck, ShoppingBag, Truck } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type TimelineStep = {
  label: string
  date: string
  done: boolean
  current?: boolean
}

type OrderProduct = {
  id: string
  name: string
  store: string
  quantity: number
  unitPrice: number
}

type OrderDetail = {
  id: string
  date: string
  status: string
  deliveryMethod: string
  estimate: string
  tracking: string
  address: string
  paymentMethod: string
  shipping: number
  discount: number
  products: OrderProduct[]
  timeline: TimelineStep[]
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const ordersMap: Record<string, OrderDetail> = {
  'CLI-20318': {
    id: 'CLI-20318',
    date: 'Hoje, 10:34',
    status: 'Em preparação',
    deliveryMethod: 'Transportadora expressa',
    estimate: 'Entrega em 2 dias úteis',
    tracking: 'BR-EXP-998711',
    address: 'Rua das Confecções, 144 - Setor Central, Goiânia - GO',
    paymentMethod: 'Cartão de crédito',
    shipping: 24.9,
    discount: 32.8,
    products: [
      { id: 'p1', name: 'Blazer Alfaiataria', store: 'Loja Aurora Fashion', quantity: 2, unitPrice: 189.9 },
      { id: 'p2', name: 'Calça Reta Premium', store: 'Loja Aurora Fashion', quantity: 4, unitPrice: 95.5 },
    ],
    timeline: [
      { label: 'Pedido realizado', date: 'Hoje, 10:34', done: true },
      { label: 'Pagamento aprovado', date: 'Hoje, 10:36', done: true },
      { label: 'Preparação', date: 'Hoje, 11:10', done: true, current: true },
      { label: 'Enviado', date: 'Previsão: hoje 18:00', done: false },
      { label: 'Entregue', date: 'Previsão: em 2 dias úteis', done: false },
    ],
  },
  'CLI-20297': {
    id: 'CLI-20297',
    date: 'Ontem, 16:08',
    status: 'Enviado',
    deliveryMethod: 'Entrega padrão',
    estimate: 'Entrega em 3 a 5 dias úteis',
    tracking: 'BR-STD-554311',
    address: 'Av. Independência, 1200 - Campinas, SP',
    paymentMethod: 'PIX',
    shipping: 19.9,
    discount: 0,
    products: [
      { id: 'p3', name: 'Camisa Premium', store: 'Central Mix Atacado', quantity: 3, unitPrice: 129.9 },
      { id: 'p4', name: 'Saia Midi', store: 'Central Mix Atacado', quantity: 2, unitPrice: 175.15 },
    ],
    timeline: [
      { label: 'Pedido realizado', date: 'Ontem, 16:08', done: true },
      { label: 'Pagamento aprovado', date: 'Ontem, 16:10', done: true },
      { label: 'Preparação', date: 'Ontem, 18:20', done: true },
      { label: 'Enviado', date: 'Hoje, 09:00', done: true, current: true },
      { label: 'Entregue', date: 'Previsão: em 3 dias úteis', done: false },
    ],
  },
}

export function PedidoDetalhePage() {
  const { pedidoId } = useParams({ from: '/cliente/pedidos/$pedidoId' })
  const [feedback, setFeedback] = useState<string | null>(null)

  const order = ordersMap[pedidoId]

  if (!order) {
    return (
      <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
        <section className="mx-auto w-full max-w-4xl rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)]">
          <p className="text-foreground">Pedido não encontrado.</p>
          <Button className="mt-4" render={<Link to="/cliente/pedidos" />}>Voltar para meus pedidos</Button>
        </section>
      </main>
    )
  }

  const subtotal = order.products.reduce((acc, product) => acc + product.unitPrice * product.quantity, 0)
  const total = subtotal + order.shipping - order.discount

  function actionMessage(message: string) {
    setFeedback(message)
    setTimeout(() => setFeedback(null), 1800)
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Detalhes do pedido</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-foreground-subtle">
            <span>Pedido #{order.id}</span>
            <span>•</span>
            <span>{order.date}</span>
            <Badge variant="secondary">{order.status}</Badge>
          </div>
        </header>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Andamento do pedido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-5 pb-5">
            {order.timeline.map((step) => (
              <div key={step.label} className={`flex items-start gap-3 rounded-xl px-3 py-2 ${step.current ? 'bg-primary/10' : 'bg-surface-alt/65'}`}>
                {step.done ? <CheckCircle2 className="mt-0.5 size-4 text-primary" /> : <Circle className="mt-0.5 size-4 text-foreground-subtle" />}
                <div>
                  <p className={`font-medium ${step.current ? 'text-primary' : 'text-foreground'}`}>{step.label}</p>
                  <p className="text-sm text-foreground-subtle">{step.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                {order.products.map((product) => {
                  const itemSubtotal = product.unitPrice * product.quantity
                  return (
                    <article key={product.id} className="rounded-xl bg-surface-alt/70 p-3">
                      <div className="flex gap-3">
                        <div className="h-16 w-16 rounded-xl bg-linear-135 from-primary/25 to-secondary/25" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-foreground-subtle">{product.store}</p>
                          <p className="mt-1 text-sm text-foreground-subtle">Qtd {product.quantity} • Unitário {currency.format(product.unitPrice)}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{currency.format(itemSubtotal)}</p>
                      </div>
                    </article>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5 text-sm">
                <p><span className="text-foreground-subtle">Endereço: </span>{order.address}</p>
                <p><span className="text-foreground-subtle">Método: </span>{order.deliveryMethod}</p>
                <p><span className="text-foreground-subtle">Prazo estimado: </span>{order.estimate}</p>
                <p><span className="text-foreground-subtle">Rastreio: </span>{order.tracking}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5 text-sm">
                <p><span className="text-foreground-subtle">Método: </span>{order.paymentMethod}</p>
                <div className="rounded-xl bg-surface-alt/70 p-3">
                  <div className="flex items-center justify-between"><span className="text-foreground-subtle">Subtotal</span><span>{currency.format(subtotal)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-foreground-subtle">Frete</span><span>{currency.format(order.shipping)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-foreground-subtle">Desconto</span><span>-{currency.format(order.discount)}</span></div>
                  <div className="mt-2 border-t border-border/50 pt-2 flex items-center justify-between font-semibold"><span>Total final</span><span>{currency.format(total)}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Suporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5">
                <Button className="w-full" variant="secondary" onClick={() => actionMessage('Rastreamento aberto com sucesso.') }>
                  <Truck className="size-4" />
                  Acompanhar entrega
                </Button>
                <Button className="w-full" onClick={() => actionMessage('Itens adicionados ao carrinho novamente.') }>
                  <ShoppingBag className="size-4" />
                  Comprar novamente
                </Button>
                <Button className="w-full" variant="ghost" onClick={() => actionMessage('Canal de suporte iniciado para este pedido.') }>
                  <Headset className="size-4" />
                  Solicitar suporte
                </Button>
                {feedback ? (
                  <div className="rounded-lg bg-secondary/12 px-2 py-2 text-sm text-secondary-foreground">{feedback}</div>
                ) : null}
                <Button variant="outline" className="w-full" render={<Link to="/cliente/pedidos" />}>
                  <PackageCheck className="size-4" />
                  Voltar para meus pedidos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
