import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Clock3, PackageCheck, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ApiError } from '@/lib/api'
import {
  listSellerOrders,
  type Order,
  type OrderStatus,
  orderQueryKeys,
  updateSellerOrderStatus,
} from '@/lib/orders'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Recebido',
  confirmed: 'Confirmado',
  preparing: 'Em separacao',
  ready_to_ship: 'Pronto para envio',
  shipped: 'Enviado',
  delivered: 'Entregue',
  canceled: 'Cancelado',
}

const nextStatusByStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready_to_ship',
  ready_to_ship: 'shipped',
  shipped: 'delivered',
}

function statusVariant(
  status: OrderStatus,
): 'default' | 'secondary' | 'outline' {
  if (status === 'preparing' || status === 'ready_to_ship') return 'secondary'
  if (status === 'pending' || status === 'confirmed') return 'outline'
  return 'default'
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateTimeFormatter.format(date)
}

function shortOrderId(orderId: string) {
  return orderId.slice(0, 8).toUpperCase()
}

function countItems(order: Order) {
  return order.items.reduce((total, item) => total + item.quantity, 0)
}

export function LojistaPedidosPage() {
  const queryClient = useQueryClient()
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const ordersQuery = useQuery({
    queryKey: orderQueryKeys.seller,
    queryFn: listSellerOrders,
  })
  const statusMutation = useMutation({
    mutationFn: updateSellerOrderStatus,
    onSuccess: () => {
      setFeedback('Status do pedido atualizado.')
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.seller })
    },
    onError: (error) => {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel atualizar o pedido.',
      )
    },
  })

  const orders = ordersQuery.data?.orders ?? []
  const summary = useMemo(
    () => ({
      total: orders.length,
      preparing: orders.filter((order) =>
        ['confirmed', 'preparing', 'ready_to_ship'].includes(order.status),
      ).length,
      shipped: orders.filter((order) =>
        ['shipped', 'delivered'].includes(order.status),
      ).length,
    }),
    [orders],
  )

  function updateStatus(orderId: string, status: OrderStatus) {
    setFeedback(null)
    statusMutation.mutate({ orderId, status })
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
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
              Gestao de pedidos
            </h1>
            <p className="text-sm text-foreground-subtle sm:text-base">
              Acompanhe pedidos reais da sua loja e atualize o fluxo de envio.
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={ordersQuery.isFetching}
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: orderQueryKeys.seller })
            }
          >
            Atualizar painel
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Pedidos da loja"
            value={String(summary.total)}
            icon={Clock3}
          />
          <SummaryCard
            title="Em preparacao"
            value={String(summary.preparing)}
            icon={PackageCheck}
          />
          <SummaryCard
            title="Despachados"
            value={String(summary.shipped)}
            icon={Truck}
          />
        </div>

        {feedback ? (
          <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
            {feedback}
          </div>
        ) : null}

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Pedidos recentes</CardTitle>
            <CardDescription>Dados sincronizados com a API</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {ordersQuery.isLoading ? (
              <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center text-sm text-foreground-subtle">
                Carregando pedidos...
              </div>
            ) : null}

            {!ordersQuery.isLoading && orders.length === 0 ? (
              <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center text-sm text-foreground-subtle">
                Nenhum pedido recebido ainda.
              </div>
            ) : null}

            <div className="space-y-3">
              {orders.map((order) => {
                const nextStatus = nextStatusByStatus[order.status]

                return (
                  <article
                    key={order.id}
                    className="rounded-xl bg-surface-alt/75 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          #{shortOrderId(order.id)}
                        </p>
                        <p className="text-sm text-foreground-subtle">
                          Cliente {shortOrderId(order.customerId)}
                        </p>
                      </div>
                      <span className="text-sm text-foreground-subtle">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{countItems(order)} itens</Badge>
                      <Badge>
                        {order.paymentStatus === 'paid'
                          ? 'Pagamento aprovado'
                          : 'Pagamento pendente'}
                      </Badge>
                      <Badge variant={statusVariant(order.status)}>
                        {statusLabels[order.status]}
                      </Badge>
                      {order.trackingCode ? (
                        <Badge variant="outline">{order.trackingCode}</Badge>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm font-semibold text-foreground">
                      {currency.format(order.totalInCents / 100)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8"
                        onClick={() =>
                          setExpandedOrderId((value) =>
                            value === order.id ? null : order.id,
                          )
                        }
                      >
                        Ver detalhes
                      </Button>
                      {nextStatus ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-8"
                          disabled={statusMutation.isPending}
                          onClick={() => updateStatus(order.id, nextStatus)}
                        >
                          Avancar para {statusLabels[nextStatus]}
                        </Button>
                      ) : null}
                      {order.status !== 'shipped' &&
                      order.status !== 'delivered' &&
                      order.status !== 'canceled' ? (
                        <Button
                          type="button"
                          className="h-8"
                          disabled={statusMutation.isPending}
                          onClick={() => updateStatus(order.id, 'shipped')}
                        >
                          Marcar como enviado
                        </Button>
                      ) : null}
                    </div>

                    {expandedOrderId === order.id ? (
                      <div className="mt-3 grid gap-2 rounded-xl bg-surface px-3 py-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground-subtle">
                            Pagamento
                          </span>
                          <span className="font-medium text-foreground">
                            {order.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-foreground-subtle">Envio</span>
                          <span className="font-medium text-foreground">
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground-subtle">
                            Itens do pedido
                          </span>
                          <ul className="mt-1 space-y-1">
                            {order.items.map((item) => (
                              <li key={item.id} className="text-foreground">
                                - {item.productName} ({item.quantity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: typeof Clock3
}) {
  return (
    <Card className="rounded-2xl py-0">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-foreground-subtle">{title}</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-foreground">
            {value}
          </p>
        </div>
        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  )
}
