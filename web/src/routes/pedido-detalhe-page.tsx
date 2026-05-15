import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  MapPin,
  PackageCheck,
  PackageOpen,
  ReceiptText,
  ShoppingCart,
  ThumbsUp,
  Truck,
  Undo2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import productBlazerImage from '@/assets/stitch/product-blazer.png'
import { Button } from '@/components/ui/button'
import { type Address, addressQueryKeys, listAddresses } from '@/lib/addresses'
import {
  getOrder,
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

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pedido recebido',
  confirmed: 'Pedido confirmado',
  preparing: 'Pedido em separacao',
  ready_to_ship: 'Mercadoria pronta',
  shipped: 'Mercadoria em transito',
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
  boleto: 'BOLETO',
}

const timelineStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'ready_to_ship',
  'shipped',
  'delivered',
] as const

type TimelineStatus = (typeof timelineStatuses)[number]

const timelineIcons = {
  pending: ShoppingCart,
  confirmed: ReceiptText,
  preparing: PackageOpen,
  ready_to_ship: PackageCheck,
  shipped: Truck,
  delivered: Check,
} satisfies Record<TimelineStatus, typeof ShoppingCart>

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

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateTimeFormatter.format(date)
}

function shortOrderId(orderId: string) {
  return orderId.slice(0, 8).toUpperCase()
}

function formatAddress(address: Address | undefined, addressId: string | null) {
  if (!address) {
    return addressId
      ? `Endereco do checkout: ${addressId}`
      : 'Endereco nao informado para este pedido.'
  }

  const complement = address.complement ? `, ${address.complement}` : ''
  const recipient = address.recipient ? `${address.recipient} - ` : ''

  return `${recipient}${address.street}, ${address.number}${complement}, ${address.district}, ${address.city} - ${address.state}, ${address.zipCode}`
}

function getTimeline(order: Order) {
  const trackableStatus: TimelineStatus =
    order.status === 'canceled' ? 'pending' : order.status
  const currentStatusIndex = timelineStatuses.indexOf(trackableStatus)
  const currentIndex = currentStatusIndex >= 0 ? currentStatusIndex : 0

  return timelineStatuses.map((status, index) => {
    const event = order.events.find((item) => item.status === status)
    const completed =
      order.status !== 'canceled' && index <= Math.max(currentIndex, 0)

    return {
      status,
      label: statusLabels[status],
      completed,
      current: order.status === status,
      date:
        event?.createdAt ??
        (index === 0 ? order.createdAt : 'Aguardando atualizacao'),
      message: event?.message,
    }
  })
}

export function PedidoDetalhePage() {
  const { pedidoId } = useParams({ from: '/cliente/pedidos/$pedidoId' })
  const [feedback, setFeedback] = useState<string | null>(null)

  const orderQuery = useQuery({
    queryKey: orderQueryKeys.detail(pedidoId),
    queryFn: () => getOrder(pedidoId),
  })
  const addressesQuery = useQuery({
    queryKey: addressQueryKeys.all,
    queryFn: listAddresses,
  })

  const order = orderQuery.data?.order
  const address = useMemo(
    () =>
      order?.addressId
        ? addressesQuery.data?.addresses.find(
            (item) => item.id === order.addressId,
          )
        : undefined,
    [addressesQuery.data?.addresses, order?.addressId],
  )

  function actionMessage(message: string) {
    setFeedback(message)
    setTimeout(() => setFeedback(null), 1800)
  }

  if (orderQuery.isLoading) {
    return (
      <main className="grid min-h-[calc(100vh-76px)] place-items-center bg-[#eef2f7] px-6 py-10 text-foreground-subtle">
        Carregando detalhes do pedido...
      </main>
    )
  }

  if (orderQuery.isError || !order) {
    return (
      <main className="grid min-h-[calc(100vh-76px)] place-items-center bg-[#eef2f7] px-6 py-10">
        <div className="rounded-xl border border-border/70 bg-white p-6 text-center shadow-sm">
          <p className="font-medium text-foreground">Pedido nao encontrado.</p>
          <Button className="mt-4" render={<Link to="/cliente/pedidos" />}>
            Voltar para meus pedidos
          </Button>
        </div>
      </main>
    )
  }

  const timeline = getTimeline(order)
  const firstItem = order.items[0]
  const statusTone =
    order.status === 'canceled' ? 'text-destructive' : 'text-green-600'

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#eef2f7] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-screen-2xl space-y-4">
        <p className={`text-sm font-bold ${statusTone}`}>
          {statusLabels[order.status]}.
        </p>

        <div className="grid gap-4 xl:grid-cols-[1fr_29rem]">
          <section className="rounded-sm border border-border/70 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-6 border-border/70 border-b pb-6 lg:flex-row lg:justify-between">
              <div className="space-y-5">
                {order.items.map((item) => (
                  <article key={item.id} className="flex gap-3">
                    <img
                      src={item.productImageUrl ?? productBlazerImage}
                      alt={item.productName}
                      className="size-20 rounded-sm border border-border/70 object-cover"
                    />
                    <div className="min-w-0">
                      <span className="inline-flex rounded-sm bg-surface-alt px-1.5 py-0.5 text-xs font-medium text-foreground-subtle">
                        Vendido e entregue pelo Hub44
                      </span>
                      <p className="mt-2 font-bold text-foreground">
                        {item.productName}
                      </p>
                      <p className="mt-2 text-sm text-foreground-subtle">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="flex min-w-36 flex-col items-start gap-2 text-sm lg:items-end">
                <p className="font-bold text-foreground-subtle">
                  Entrega 1 de 1:
                </p>
                <p className="font-heading text-xl font-bold text-foreground">
                  {formatCurrency(firstItem?.subtotalInCents ?? 0)}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-border/70 border-b py-6">
              <div>
                <p className="font-bold text-foreground">RASTREIO:</p>
                <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-foreground-subtle">
                  {order.deliveryMethod}
                  {order.trackingCode ? (
                    <>
                      <span className="font-bold text-secondary">
                        {order.trackingCode}
                      </span>
                      <Copy className="size-4 text-foreground-subtle" />
                    </>
                  ) : (
                    <span className="text-foreground-subtle">
                      Codigo ainda nao informado
                    </span>
                  )}
                </p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-12 rounded-sm border-secondary text-secondary hover:bg-secondary/10"
                  onClick={() =>
                    actionMessage('Rastreamento detalhado aberto.')
                  }
                >
                  <Truck className="size-4" />
                  Rastreio detalhado
                </Button>
                <Button
                  className="h-12 rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary-hover"
                  onClick={() => actionMessage('Central do pedido aberta.')}
                >
                  <ShoppingCart className="size-4" />
                  Gerenciar pedido
                </Button>
              </div>
            </div>

            <div className="py-7">
              <div className="grid gap-5 lg:grid-cols-6">
                {timeline.map((step, index) => {
                  const Icon = timelineIcons[step.status]

                  return (
                    <div
                      key={step.status}
                      className="relative flex gap-3 lg:flex-col lg:items-center lg:text-center"
                    >
                      {index < timeline.length - 1 ? (
                        <span
                          className={`absolute top-5 left-[50%] hidden h-0.5 w-full lg:block ${
                            step.completed ? 'bg-secondary' : 'bg-border'
                          }`}
                        />
                      ) : null}
                      <span
                        className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ${
                          step.completed
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-surface-alt text-foreground-subtle'
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold ${
                            step.current ? 'text-secondary' : 'text-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="mt-1 text-xs text-foreground-subtle">
                          {step.date === 'Aguardando atualizacao'
                            ? step.date
                            : formatDateTime(step.date)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-secondary/10 px-4 py-3 text-center text-sm font-bold text-foreground">
              <Truck className="mr-2 inline size-4 text-secondary" />
              {order.status === 'delivered'
                ? 'Pedido entregue para:'
                : 'Pedido destinado para:'}{' '}
              {address?.recipient ?? 'destinatario informado no checkout'}
            </div>
          </section>

          <aside className="space-y-3">
            <section className="rounded-sm border border-border/70 bg-white p-5 shadow-sm">
              <div className="border-border/70 border-b pb-3">
                <p className="flex items-center gap-2 font-bold text-foreground">
                  {formatDate(order.createdAt)} - Pedido{' '}
                  {shortOrderId(order.id)}
                  <Copy className="size-4 text-foreground-subtle" />
                </p>
              </div>

              <div className="space-y-4 py-4 text-sm">
                <div>
                  <p className="mb-1 flex items-center gap-2 font-bold text-foreground">
                    <MapPin className="size-4 text-secondary" />
                    Endereco de entrega
                  </p>
                  <p className="text-foreground-subtle">
                    {formatAddress(address, order.addressId)}
                  </p>
                </div>

                <div>
                  <p className="mb-1 flex items-center gap-2 font-bold text-foreground">
                    <CreditCard className="size-4 text-secondary" />
                    Pagamento via {paymentMethodLabels[order.paymentMethod]}.
                  </p>
                  <p className="text-foreground-subtle">
                    {paymentLabels[order.paymentStatus]}
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-border/70 border-t pt-4 text-sm">
                <PriceRow
                  label="Total produto(s):"
                  value={formatCurrency(order.subtotalInCents)}
                />
                <PriceRow
                  label="Frete:"
                  value={formatCurrency(order.shippingInCents)}
                />
                <PriceRow
                  label="Desconto:"
                  value={`- ${formatCurrency(order.discountInCents)}`}
                />
                <div className="mt-2 flex items-center justify-between bg-surface-alt px-2 py-1 font-bold text-foreground">
                  <span>Total do pedido:</span>
                  <span>{formatCurrency(order.totalInCents)}</span>
                </div>
              </div>
            </section>

            <section className="space-y-2 rounded-sm border border-border/70 bg-white p-5 shadow-sm">
              <Button
                className="h-12 w-full rounded-sm bg-secondary text-secondary-foreground hover:bg-secondary-hover"
                onClick={() => actionMessage('Avaliacao de produtos aberta.')}
              >
                <ThumbsUp className="size-4" />
                Avaliar produtos
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full rounded-sm border-secondary text-secondary hover:bg-secondary/10"
                render={<Link to="/cliente/pedidos" />}
              >
                <Undo2 className="size-4" />
                Voltar aos meus pedidos
              </Button>
              {feedback ? (
                <div className="rounded-sm bg-secondary/10 px-3 py-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="mr-1 inline size-4 text-secondary" />
                  {feedback}
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-foreground-subtle">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}
