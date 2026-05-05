import { Link } from '@tanstack/react-router'
import { ArrowLeft, BadgeCheck, Clock3, MapPin, Star, Store } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const shopInfo = {
  name: 'Loja Aurora Fashion',
  description: 'Moda feminina com curadoria premium para atacado e revenda.',
  location: 'Região da 44, Goiânia - GO',
  hours: 'Seg a Sáb, 08:00 às 18:00',
}

const metrics = [
  { label: 'Avaliação média', value: '4,8/5', icon: Star },
  { label: 'Pedidos no mês', value: '286', icon: BadgeCheck },
  { label: 'Produtos ativos', value: '124', icon: Store },
]

const showcase = [
  { name: 'Blazer Alfaiataria', category: 'Feminino', price: 'R$ 189,90', stock: '32 un' },
  { name: 'Conjunto Linho', category: 'Casual chic', price: 'R$ 249,90', stock: '18 un' },
  { name: 'Camisa Premium', category: 'Social', price: 'R$ 129,90', stock: '44 un' },
]

export function LojistaLojaPage() {
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
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Página da loja</h1>
            <p className="text-sm text-foreground-subtle sm:text-base">Resumo público da sua vitrine e desempenho comercial.</p>
          </div>
          <Button variant="secondary" render={<Link to="/lojista/produtos/novo" />}>
            Cadastrar produto
          </Button>
        </div>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>{shopInfo.name}</CardTitle>
            <CardDescription>{shopInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <MapPin className="size-3.5" />
                {shopInfo.location}
              </Badge>
              <Badge variant="outline">
                <Clock3 className="size-3.5" />
                {shopInfo.hours}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.label} className="rounded-2xl py-0">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-foreground-subtle">{metric.label}</p>
                    <p className="mt-1 font-heading text-2xl font-semibold text-foreground">{metric.value}</p>
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
            <CardTitle>Vitrine da loja</CardTitle>
            <CardDescription>Produtos em destaque com dados simulados</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {showcase.map((item) => (
                <article key={item.name} className="rounded-xl bg-surface-alt/75 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-foreground-subtle">{item.category}</p>
                    </div>
                    <Badge variant="secondary">{item.stock}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{item.price}</p>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
