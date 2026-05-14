import { Link } from '@tanstack/react-router'
import { CheckCircle2, PackageCheck, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PedidoSucessoPage() {
  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto flex w-full max-w-3xl justify-center rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <Card className="w-full rounded-2xl py-0">
          <CardContent className="space-y-5 p-6 text-center md:p-8">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/12 text-primary">
              <CheckCircle2 className="size-9" />
            </div>

            <div className="space-y-1">
              <h1 className="font-heading text-3xl font-bold text-foreground">Pedido realizado com sucesso</h1>
              <p className="text-sm text-foreground-subtle sm:text-base">
                Seu pedido foi confirmado e ja entrou em processamento.
              </p>
            </div>

            <div className="rounded-xl bg-surface-alt/70 p-4 text-left text-sm">
              <p className="font-semibold text-foreground">Pedido #H44-93812</p>
              <p className="mt-1 text-foreground-subtle">Previsao de entrega: 3 a 5 dias uteis</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">3 itens</Badge>
                <Badge>Pagamento aprovado</Badge>
                <Badge variant="secondary">Total R$ 989,44</Badge>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button className="h-11" render={<Link to="/cliente/pedidos" />}>
                <PackageCheck className="size-4" />
                Acompanhar pedido
              </Button>
              <Button variant="secondary" className="h-11" render={<Link to="/marketplace" />}>
                <Truck className="size-4" />
                Voltar ao marketplace
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
