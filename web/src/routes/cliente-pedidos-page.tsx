import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  PackageCheck,
  ReceiptText,
  Search,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import productBlazerImage from '@/assets/stitch/product-blazer.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resolveApiAssetUrl } from '@/lib/api'
import {
  listOrders,
  type Order,
  type OrderStatus,
  orderQueryKeys,
  type PaymentMethod,
  type PaymentStatus,
} from '@/lib/orders'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR')

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pedido recebido',
  confirmed: 'Pedido confirmado',
  preparing: 'Pedido em preparacao',
  ready_to_ship: 'Pronto para envio',
  shipped: 'Pedido enviado',
  delivered: 'Pedido concluido',
  canceled: 'Pedido cancelado',
}

const paymentLabels: Record<PaymentStatus, string> = {
  pending: 'Pagamento pendente',
  paid: 'Pagamento aprovado',
  failed: 'Pagamento recusado',
  refunded: 'Pagamento reembolsado',
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: 'CARTAO DE CREDITO',
  pix: 'PIX',
}

const statusFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Em andamento', value: 'active' },
  { label: 'Entregues', value: 'delivered' },
  { label: 'Aguardando pagamento', value: 'payment_pending' },
] as const

type StatusFilter = (typeof statusFilters)[number]['value']

function formatCurrency(cents: number) {
  return currency.format(cents / 100)
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateFormatter.format(date)
}

function shortOrderId(orderId: string) {
  return orderId.slice(0, 8).toUpperCase()
}

function getStoreLabel(storeId: string) {
  return `Loja ${storeId.slice(0, 8).toUpperCase()}`
}

function getVisibleStatus(order: Order) {
  if (order.paymentStatus === 'pending') {
    return paymentLabels.pending
  }

  return statusLabels[order.status]
}

function matchesFilter(order: Order, filter: StatusFilter) {
  if (filter === 'all') {
    return true
  }

  if (filter === 'active') {
    return !['delivered', 'canceled'].includes(order.status)
  }

  if (filter === 'payment_pending') {
    return order.paymentStatus === 'pending'
  }

  return order.status === filter
}

function getSummary(orders: Order[]) {
  return {
    active: orders.filter((order) => matchesFilter(order, 'active')).length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
    pendingPayment: orders.filter((order) => order.paymentStatus === 'pending')
      .length,
    totalSpent: orders.reduce(
      (total, order) =>
        order.paymentStatus === 'paid' ? total + order.totalInCents : total,
      0,
    ),
  }
}

export function ClientePedidosPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const ordersQuery = useQuery({
    queryKey: orderQueryKeys.all,
    queryFn: listOrders,
  })

  const orders = ordersQuery.data?.orders ?? []
  const summary = useMemo(() => getSummary(orders), [orders])
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = matchesFilter(order, statusFilter)

      if (!query) {
        return matchesStatus
      }

      const matchesSearch =
        order.id.toLowerCase().includes(query) ||
        getStoreLabel(order.storeId).toLowerCase().includes(query) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(query),
        )

      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#eef2f7] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-screen-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Meus pedidos
          </h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Acompanhe status, pagamento e entrega dos seus pedidos em um so
            lugar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Truck}
            label="Em andamento"
            value={String(summary.active)}
          />
          <SummaryCard
            icon={PackageCheck}
            label="Entregues"
            value={String(summary.delivered)}
          />
          <SummaryCard
            icon={CreditCard}
            label="Aguardando pagamento"
            value={String(summary.pendingPayment)}
          />
          <SummaryCard
            icon={CircleDollarSign}
            label="Total gasto"
            value={formatCurrency(summary.totalSpent)}
          />
        </div>

        <div className="rounded-xl border border-border/70 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-subtle" />
              <Input
                className="h-11 pl-10"
                placeholder="Busque por pedido, loja ou produto..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  size="lg"
                  variant={
                    statusFilter === filter.value ? 'default' : 'outline'
                  }
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {ordersQuery.isLoading ? (
            <StateBox message="Carregando seus pedidos..." />
          ) : null}

          {ordersQuery.isError ? (
            <StateBox message="Nao foi possivel carregar seus pedidos agora." />
          ) : null}

          {!ordersQuery.isLoading && filteredOrders.length === 0 ? (
            <StateBox message="Nenhum pedido encontrado para esses filtros." />
          ) : null}

          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </section>
    </main>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck
  label: string
  value: string
}) {
  return (
    <article className="flex min-h-24 items-center justify-between rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-foreground-subtle">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold text-foreground">
          {value}
        </p>
      </div>
      <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
    </article>
  )
}

function StateBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-white p-6 text-sm font-medium text-foreground-subtle shadow-sm">
      {message}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const firstItem = order.items[0]
  const extraItemsCount = Math.max(order.items.length - 1, 0)
  const status = getVisibleStatus(order)

  return (
    <article className="overflow-hidden rounded-sm border border-border/80 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-border/80 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-foreground-subtle">
          <span className="font-bold text-foreground">Pedido:</span>{' '}
          <span>{shortOrderId(order.id)}</span>
          <span className="mx-2">-</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="h-9 rounded-sm bg-secondary px-4 text-secondary-foreground hover:bg-secondary-hover"
            render={
              <Link
                to="/cliente/pedidos/$pedidoId"
                params={{ pedidoId: order.id }}
              />
            }
          >
            <ShoppingCart className="size-4" />
            Gerenciar pedido
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-sm border-secondary px-4 text-secondary hover:bg-secondary/10"
            render={
              <Link
                to="/cliente/pedidos/$pedidoId"
                params={{ pedidoId: order.id }}
              />
            }
          >
            Ver detalhes
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      <div className="border-border/80 border-b px-4 py-3">
        <p
          className={`text-sm font-bold ${
            order.status === 'canceled' ? 'text-destructive' : 'text-green-600'
          }`}
        >
          {status}.
        </p>
      </div>

      <div className="flex items-center gap-2 border-border/80 border-b px-4 py-3 text-sm font-bold text-foreground-subtle">
        <CreditCard className="size-4 text-secondary" />
        Pagamento via {paymentMethodLabels[order.paymentMethod]}.
        <span className="font-semibold text-foreground-subtle">
          {paymentLabels[order.paymentStatus]}.
        </span>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[5rem_1fr_auto] md:items-center">
        <img
          src={
            firstItem?.productImageUrl
              ? resolveApiAssetUrl(firstItem.productImageUrl)
              : productBlazerImage
          }
          alt={firstItem?.productName ?? 'Produto do pedido'}
          className="size-20 rounded-sm border border-border/70 object-cover"
        />

        <div className="min-w-0">
          <span className="inline-flex rounded-sm bg-surface-alt px-1.5 py-0.5 text-xs font-medium text-foreground-subtle">
            Vendido e entregue por {getStoreLabel(order.storeId)}
          </span>
          <p className="mt-2 font-bold text-foreground">
            {firstItem?.productName ?? 'Pedido sem itens'}
          </p>
          <p className="mt-1 text-sm text-foreground-subtle">
            Quantidade: {firstItem?.quantity ?? 0}
            {extraItemsCount > 0 ? ` + ${extraItemsCount} item(ns)` : ''}
          </p>
          {order.trackingCode ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-foreground-subtle">
              <ReceiptText className="size-4" />
              Rastreio {order.trackingCode}
            </p>
          ) : null}
        </div>

        <p className="font-heading text-lg font-bold text-foreground">
          {formatCurrency(order.totalInCents)}
        </p>
      </div>
    </article>
  )
}
