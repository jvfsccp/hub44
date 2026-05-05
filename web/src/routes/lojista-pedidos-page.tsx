import { Link } from '@tanstack/react-router'
import { ArrowLeft, Clock3, PackageCheck, Truck } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const orderSummary = [
  { label: 'Pedidos hoje', value: '14', icon: Clock3 },
  { label: 'Em separacao', value: '9', icon: PackageCheck },
  { label: 'Despachados', value: '5', icon: Truck },
]

const orders = [
  { id: '#H44-9132', customer: 'Atacado Santa Clara', items: 12, total: 'R$ 2.480,00', payment: 'Pago', shipping: 'Separando', region: 'Belo Horizonte - MG', date: 'Hoje, 11:24', products: ['Blazer Alfaiataria (4)', 'Conjunto Linho (6)', 'Camisa Premium (2)'] },
  { id: '#H44-9128', customer: 'Boutique Manzoni', items: 6, total: 'R$ 1.190,00', payment: 'Pago', shipping: 'Pronto para envio', region: 'Campinas - SP', date: 'Hoje, 09:53', products: ['Vestido Midi (3)', 'Camisa Social (3)'] },
  { id: '#H44-9121', customer: 'Moda Centro Norte', items: 18, total: 'R$ 3.920,00', payment: 'Aprovado', shipping: 'Enviado', region: 'Brasília - DF', date: 'Ontem, 17:48', products: ['Calça Reta (8)', 'Blusa Seda (10)'] },
  { id: '#H44-9115', customer: 'Loja Aurora Mix', items: 4, total: 'R$ 780,00', payment: 'Pago', shipping: 'Separando', region: 'Curitiba - PR', date: 'Ontem, 15:10', products: ['Saia Midi (2)', 'Camisa Premium (2)'] },
]

function shippingVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'Separando') return 'secondary'
  if (status === 'Pronto para envio') return 'outline'
  return 'default'
}

export function LojistaPedidosPage() {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0].id)
  const [orderShipping, setOrderShipping] = useState(() =>
    Object.fromEntries(orders.map((order) => [order.id, order.shipping])),
  )

  function markAsShipped(orderId: string) {
    setOrderShipping((current) => ({
      ...current,
      [orderId]: 'Enviado',
    }))
  }

  function cycleStatus(orderId: string) {
    setOrderShipping((current) => {
      const currentStatus = current[orderId]
      const nextStatus =
        currentStatus === 'Separando'
          ? 'Pronto para envio'
          : currentStatus === 'Pronto para envio'
            ? 'Enviado'
            : 'Separando'

      return {
        ...current,
        [orderId]: nextStatus,
      }
    })
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/lojista/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground-subtle transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Voltar ao dashboard
            </Link>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Gestão de pedidos
            </h1>
            <p className="text-sm text-foreground-subtle sm:text-base">
              Acompanhe e priorize os pedidos mais recentes da sua operação.
            </p>
          </div>
          <Button variant="secondary" render={<Link to="/lojista/pedidos" />}>
            Atualizar painel
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {orderSummary.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.label} className="rounded-2xl py-0">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-foreground-subtle">{item.label}</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-foreground">{item.value}</p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Pedidos recentes</CardTitle>
            <CardDescription>Dados simulados locais para o fluxo do lojista</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl bg-surface-alt/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-sm text-foreground-subtle">{order.customer}</p>
                    </div>
                    <span className="text-sm text-foreground-subtle">{order.date}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{order.items} itens</Badge>
                    <Badge>{order.payment}</Badge>
                    <Badge variant={shippingVariant(orderShipping[order.id])}>{orderShipping[order.id]}</Badge>
                    <Badge variant="outline">{order.region}</Badge>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-foreground">{order.total}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8"
                      onClick={() => setExpandedOrderId((value) => (value === order.id ? null : order.id))}
                    >
                      Ver detalhes
                    </Button>
                    <Button type="button" variant="secondary" className="h-8" onClick={() => cycleStatus(order.id)}>
                      Atualizar status
                    </Button>
                    <Button type="button" className="h-8" onClick={() => markAsShipped(order.id)}>
                      Marcar como enviado
                    </Button>
                  </div>

                  {expandedOrderId === order.id ? (
                    <div className="mt-3 grid gap-2 rounded-xl bg-surface px-3 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-subtle">Cliente</span>
                        <span className="font-medium text-foreground">{order.customer}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-subtle">Pagamento</span>
                        <span className="font-medium text-foreground">{order.payment}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-subtle">Envio</span>
                        <span className="font-medium text-foreground">{orderShipping[order.id]}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-subtle">Região de entrega</span>
                        <span className="font-medium text-foreground">{order.region}</span>
                      </div>
                      <div>
                        <span className="text-foreground-subtle">Itens do pedido</span>
                        <ul className="mt-1 space-y-1">
                          {order.products.map((product) => (
                            <li key={product} className="text-foreground">- {product}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
