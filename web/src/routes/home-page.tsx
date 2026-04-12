import { Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-36 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

      <section className="mx-auto grid w-full max-w-6xl gap-10 rounded-3xl bg-surface/80 p-8 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4" />
            Hub44
          </span>

          <div className="space-y-4">
            <h1 className="font-heading text-4xl leading-tight font-bold text-foreground sm:text-5xl lg:text-6xl">
              Estamos construindo
              <span className="block bg-linear-135 from-primary to-secondary bg-clip-text text-transparent">
                o novo polo comercial digital
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-foreground-subtle">
              O Hub44 esta em construcao para conectar curadoria, operacao e
              crescimento em um unico ecossistema. Em breve, uma experiencia
              premium para o mercado regional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="h-10 px-5" render={<Link to="/components-preview" />}>
              Ver componentes
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="secondary" className="h-10 px-5">
              Lancamento em breve
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl bg-surface-alt/80 p-5">
          <div className="rounded-xl bg-surface p-4 shadow-sm">
            <p className="text-sm text-foreground-subtle">Status do Projeto</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground">
              Em desenvolvimento ativo
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <StatusPill label="Design System" value="Pronto" tone="success" />
            <StatusPill label="Frontend Base" value="Em execucao" tone="info" />
            <StatusPill label="Integracoes" value="Proxima fase" tone="warning" />
          </div>
        </div>
      </section>
    </main>
  )
}

type StatusPillProps = {
  label: string
  value: string
  tone: 'success' | 'info' | 'warning'
}

const toneClassName: Record<StatusPillProps['tone'], string> = {
  success: 'text-success bg-success/10',
  info: 'text-info bg-info/10',
  warning: 'text-warning bg-warning/10',
}

function StatusPill({ label, value, tone }: StatusPillProps) {
  return (
    <article className="flex items-center justify-between rounded-xl bg-surface p-3">
      <span className="text-sm font-medium text-foreground-subtle">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClassName[tone]}`}>
        {value}
      </span>
    </article>
  )
}
