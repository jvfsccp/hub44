import { Link } from '@tanstack/react-router'
import { ArrowLeft, CircleDollarSign, CreditCard, Headset, PackageCheck, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const summaryCards = [
  { label: 'Em andamento', value: '3', icon: Truck },
  { label: 'Entregues', value: '14', icon: PackageCheck },
  { label: 'Aguardando pagamento', value: '1', icon: CreditCard },
  { label: 'Total gasto', value: 'R$ 9.420,00', icon: CircleDollarSign },
]

const orders = [
  {
    id: '#CLI-20318',
    store: 'Loja Aurora Fashion',
    date: 'Hoje, 10:34',
    total: 'R$ 1.280,00',
    orderStatus: 'Em separacao',
    paymentStatus: 'Pago',
    deliveryMethod: 'Transportadora expressa',
    tracking: 'Pedido em preparacao para coleta',
    supportInfo: 'Atendimento em horario comercial',
    items: ['Blazer Alfaiataria (2)', 'Calca Reta Premium (4)'],
  },
  {
    id: '#CLI-20297',
    store: 'Central Mix Atacado',
    date: 'Ontem, 16:08',
    total: 'R$ 740,00',
    orderStatus: 'Enviado',
    paymentStatus: 'Pago',
    deliveryMethod: 'Entrega padrao',
    tracking: 'Saiu para transferencia de rota',
    supportInfo: 'Prazo medio de resposta: 1h',
    items: ['Camisa Premium (3)', 'Saia Midi (2)'],
  },
  {
    id: '#CLI-20265',
    store: 'Moda Centro Norte',
    date: '22/04, 12:51',
    total: 'R$ 2.190,00',
    orderStatus: 'Aguardando pagamento',
    paymentStatus: 'Pendente',
    deliveryMethod: 'Retirada na loja',
    tracking: 'Aguardando confirmacao do pagamento',
    supportInfo: 'Suporte financeiro disponivel',
    items: ['Conjunto Linho (5)', 'Vestido Midi (4)'],
  },
]

function orderVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'Em separacao') return 'secondary'
  if (status === 'Aguardando pagamento') return 'outline'
  return 'default'
}

function paymentVariant(status: string): 'default' | 'secondary' | 'outline' {
  if (status === 'Pendente') return 'outline'
  return 'default'
}

export function ClientePedidosPage() {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0].id)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Em andamento' | 'Entregues' | 'Aguardando pagamento'>('Todos')
  const [deliveryFilter, setDeliveryFilter] = useState<'Todas' | 'Transportadora expressa' | 'Entrega padrao' | 'Retirada na loja'>('Todas')
  const [orderFeedback, setOrderFeedback] = useState<Record<string, string | null>>({})

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      const normalizedOrderStatus =
        order.orderStatus === 'Enviado'
          ? 'Entregues'
          : order.orderStatus === 'Aguardando pagamento'
            ? 'Aguardando pagamento'
            : 'Em andamento'

      const matchesStatus = statusFilter === 'Todos' || normalizedOrderStatus === statusFilter
      const matchesDelivery = deliveryFilter === 'Todas' || order.deliveryMethod === deliveryFilter

      if (!query) {
        return matchesStatus && matchesDelivery
      }

      const matchesSearch =
        order.id.toLowerCase().includes(query) ||
        order.store.toLowerCase().includes(query) ||
        order.items.some((item) => item.toLowerCase().includes(query))

      return matchesStatus && matchesDelivery && matchesSearch
    })
  }, [deliveryFilter, search, statusFilter])

  function clearFilters() {
    setSearch('')
    setStatusFilter('Todos')
    setDeliveryFilter('Todas')
  }

  function showFeedback(orderId: string, message: string) {
    setOrderFeedback((current) => ({
      ...current,
      [orderId]: message,
    }))

    setTimeout(() => {
      setOrderFeedback((current) => ({
        ...current,
        [orderId]: null,
      }))
    }, 1800)
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <div className="space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-subtle transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Voltar para a home
          </Link>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Meus pedidos</h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Acompanhe status, pagamento e entrega dos seus pedidos em um so lugar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
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
            <CardTitle>Busca e filtros</CardTitle>
            <CardDescription>Encontre pedidos por codigo, loja, produto, status e entrega</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3 rounded-xl bg-surface-alt/60 p-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busque por pedido, loja ou produto..."
              />

              <div className="flex flex-wrap gap-2">
                {(['Todos', 'Em andamento', 'Entregues', 'Aguardando pagamento'] as const).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(['Todas', 'Transportadora expressa', 'Entrega padrao', 'Retirada na loja'] as const).map((delivery) => (
                  <Button
                    key={delivery}
                    type="button"
                    size="sm"
                    variant={deliveryFilter === delivery ? 'secondary' : 'outline'}
                    onClick={() => setDeliveryFilter(delivery)}
                  >
                    {delivery}
                  </Button>
                ))}
              </div>

              <div className="flex justify-end">
                <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>

              <p className="text-sm text-foreground-subtle">{filteredOrders.length} pedidos encontrados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Lista de pedidos</CardTitle>
            <CardDescription>Dados simulados locais para acompanhamento do cliente</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <article key={order.id} className="rounded-xl bg-surface-alt/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-sm text-foreground-subtle">{order.store}</p>
                    </div>
                    <span className="text-sm text-foreground-subtle">{order.date}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant={orderVariant(order.orderStatus)}>{order.orderStatus}</Badge>
                    <Badge variant={paymentVariant(order.paymentStatus)}>{order.paymentStatus}</Badge>
                    <Badge variant="outline">{order.deliveryMethod}</Badge>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-foreground">Total: {order.total}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8"
                      onClick={() => setExpandedOrderId((value) => (value === order.id ? null : order.id))}
                    >
                      Ver detalhes
                    </Button>
                  </div>

                  {expandedOrderId === order.id ? (
                    <div className="mt-3 grid gap-2 rounded-xl bg-surface px-3 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-subtle">Status do pedido</span>
                        <span className="font-medium text-foreground">{order.orderStatus}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-subtle">Status do pagamento</span>
                        <span className="font-medium text-foreground">{order.paymentStatus}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-subtle">Entrega</span>
                        <span className="font-medium text-foreground">{order.deliveryMethod}</span>
                      </div>
                      <div>
                        <span className="text-foreground-subtle">Itens comprados</span>
                        <ul className="mt-1 space-y-1">
                          {order.items.map((item) => (
                            <li key={item} className="text-foreground">- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-surface-alt/70 px-2 py-2 text-foreground-subtle">{order.tracking}</div>
                      <div className="rounded-lg bg-surface-alt/70 px-2 py-2 text-foreground-subtle">{order.supportInfo}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-8"
                          onClick={() => showFeedback(order.id, `Rastreamento aberto para ${order.id}.`)}
                        >
                          Acompanhar entrega
                        </Button>
                        <Button
                          type="button"
                          className="h-8"
                          onClick={() => showFeedback(order.id, `Itens do pedido ${order.id} adicionados ao carrinho.`)}
                        >
                          Comprar novamente
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8"
                          onClick={() => showFeedback(order.id, `Canal de suporte aberto para ${order.id}.`)}
                        >
                          <Headset className="size-4" />
                          Solicitar suporte
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8"
                          render={<Link to={`/cliente/pedidos/${order.id.replace('#', '')}`} />}
                        >
                          Abrir pagina completa
                        </Button>
                      </div>

                      {orderFeedback[order.id] ? (
                        <div className="rounded-lg bg-secondary/12 px-2 py-2 text-secondary-foreground">
                          {orderFeedback[order.id]}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}

              {filteredOrders.length === 0 ? (
                <div className="rounded-xl bg-surface-alt/75 p-4 text-sm text-foreground-subtle">
                  Nenhum pedido encontrado para os filtros selecionados.
                </div>
              ) : null}

            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
