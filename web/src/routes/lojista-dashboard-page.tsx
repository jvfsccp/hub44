import { Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  AlertTriangle,
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  PackageSearch,
  Plus,
  ShoppingBag,
  Store,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const summaryCards = [
  { label: 'Vendas hoje', value: 'R$ 12.480', detail: '+12% vs ontem', icon: CircleDollarSign },
  { label: 'Pedidos', value: '38', detail: '9 aguardando envio', icon: ClipboardList },
  { label: 'Produtos ativos', value: '124', detail: '6 em destaque', icon: Boxes },
  { label: 'Faturamento mês', value: 'R$ 182.900', detail: 'Meta: R$ 220 mil', icon: ShoppingBag },
]

const recentOrders = [
  { id: '#H44-9082', customer: 'Boutique Estilo Sul', total: 'R$ 1.980,00', status: 'Pago', time: 'Hoje, 10:42' },
  { id: '#H44-9078', customer: 'Loja Central Mix', total: 'R$ 740,00', status: 'Separando', time: 'Hoje, 09:18' },
  { id: '#H44-9071', customer: 'Varejo Prime', total: 'R$ 3.250,00', status: 'Enviado', time: 'Ontem, 17:05' },
  { id: '#H44-9064', customer: 'Moda Aurora', total: 'R$ 1.120,00', status: 'Pago', time: 'Ontem, 15:27' },
]

const quickActions = [
  { label: 'Meus produtos', to: '/lojista/produtos', icon: Plus },
  { label: 'Ver pedidos', to: '/lojista/pedidos', icon: ClipboardList },
  { label: 'Ver loja', to: '/lojista/loja', icon: Store },
]

const storeStatus = [
  { label: 'Taxa de aprovação', value: '96%' },
  { label: 'Prazo médio de envio', value: '18h' },
  { label: 'Satisfação dos compradores', value: '4,8/5' },
]

const salesMonth = {
  current: 182900,
  target: 220000,
}

const ticketMedio = 'R$ 412,30'
const bestSeller = 'Blazer Alfaiataria Premium'

const ordersByStatus = [
  { label: 'Pago', value: 21, tone: 'default' as const },
  { label: 'Separando', value: 9, tone: 'secondary' as const },
  { label: 'Enviado', value: 8, tone: 'outline' as const },
]

const quickAlerts = [
  '5 produtos com estoque abaixo do mínimo.',
  '9 pedidos aguardando envio nas próximas 12h.',
]

const monthProgress = Math.round((salesMonth.current / salesMonth.target) * 100)

export function LojistaDashboardPage() {
  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/16 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/16 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary">
              <BadgeCheck className="size-3.5" />
              Painel do lojista
            </Badge>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Dashboard da sua loja</h1>
            <p className="text-sm text-foreground-subtle sm:text-base">
              Acompanhe o desempenho da operação e priorize as próximas ações comerciais.
            </p>
          </div>
          <Button variant="secondary" render={<Link to="/lojista/produtos" />}>
            <Plus className="size-4" />
            Meus produtos
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.label} className="rounded-2xl bg-surface-raised py-0">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-foreground-subtle">{item.label}</p>
                    <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <p className="font-heading text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="mt-1 text-sm text-foreground-subtle">{item.detail}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Vendas do mês</CardTitle>
              <CardDescription>Meta comercial e performance atual</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-heading text-3xl font-bold text-foreground">R$ 182.900</p>
                    <p className="text-sm text-foreground-subtle">Meta: R$ 220.000</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    <TrendingUp className="size-3.5" />
                    {monthProgress}% da meta
                  </Badge>
                </div>
                <div className="h-2.5 rounded-full bg-surface-alt">
                  <div className="h-full rounded-full bg-linear-135 from-primary to-secondary" style={{ width: `${monthProgress}%` }} />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-surface-alt/70 px-3 py-2">
                    <p className="text-sm text-foreground-subtle">Ticket médio</p>
                    <p className="font-semibold text-foreground">{ticketMedio}</p>
                  </div>
                  <div className="rounded-xl bg-surface-alt/70 px-3 py-2">
                    <p className="text-sm text-foreground-subtle">Produto mais vendido</p>
                    <p className="font-semibold text-foreground">{bestSeller}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Pedidos por status</CardTitle>
              <CardDescription>Distribuicao operacional do dia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              {ordersByStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface-alt/70 px-3 py-2">
                  <span className="text-sm text-foreground-subtle">{item.label}</span>
                  <Badge variant={item.tone}>{item.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Pedidos recentes</CardTitle>
              <CardDescription>Últimas movimentações da sua loja</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <article key={order.id} className="rounded-xl bg-surface-alt/75 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{order.id}</p>
                        <p className="text-sm text-foreground-subtle">{order.customer}</p>
                      </div>
                      <Badge variant={order.status === 'Separando' ? 'secondary' : 'default'}>{order.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-foreground">{order.total}</span>
                      <span className="text-foreground-subtle">{order.time}</span>
                    </div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Atalhos rápidos</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.label}
                        variant="outline"
                        className="h-10 w-full justify-between"
                        render={<Link to={action.to} />}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="size-4" />
                          {action.label}
                        </span>
                        <ArrowUpRight className="size-4" />
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Alertas rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5">
                {quickAlerts.map((alert) => (
                  <div key={alert} className="flex gap-2 rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>{alert}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Status da loja</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-3">
                  {storeStatus.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface-alt/70 px-3 py-2">
                      <span className="text-sm text-foreground-subtle">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-xl bg-surface-alt/70 px-3 py-2">
                    <span className="inline-flex items-center gap-2 text-sm text-foreground-subtle">
                      <PackageSearch className="size-4" />
                      Itens em estoque baixo
                    </span>
                    <span className="font-semibold text-foreground">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
