import {
  ArrowRight,
  BadgeCheck,
  Home,
  PencilLine,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function ComponentsPreviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10 lg:px-16">
      <header className="space-y-3">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Components Preview
        </h1>
        <p className="max-w-3xl text-base text-foreground-subtle">
          Colecao inicial de componentes do Hub44 com shadcn + Base UI,
          tipografia editorial e paleta oficial.
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl bg-surface-alt p-6 md:grid-cols-2 xl:grid-cols-4">
        <PreviewBlock title="Botoes" description="Acoes com destaque e hierarquia.">
          <div className="flex flex-wrap gap-2">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="link">Terciario</Button>
          </div>
        </PreviewBlock>

        <PreviewBlock title="Campos" description="Inputs limpos e legiveis.">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Ex: Joao Silva" />
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-subtle" />
            <Input className="pl-9" placeholder="Buscar no catalogo" />
          </div>
        </PreviewBlock>

        <PreviewBlock title="Selecao" description="Checkbox e radio do fluxo de cadastro.">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-foreground-subtle">
              <Checkbox id="accept-terms" defaultChecked />
              <Label htmlFor="accept-terms">Aceito os termos</Label>
            </div>
            <RadioGroup defaultValue="regional" className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-foreground-subtle">
                <RadioGroupItem id="plan-regional" value="regional" />
                <Label htmlFor="plan-regional">Plano Regional</Label>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-subtle">
                <RadioGroupItem id="plan-global" value="global" />
                <Label htmlFor="plan-global">Plano Global</Label>
              </div>
            </RadioGroup>
          </div>
        </PreviewBlock>

        <PreviewBlock title="Status" description="Badges para operacao comercial.">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-success/10 text-success">Em estoque</Badge>
            <Badge className="bg-error/10 text-error">Esgotado</Badge>
            <Badge className="bg-info/10 text-info">Novo lote</Badge>
            <Badge variant="secondary">Curadoria</Badge>
          </div>
        </PreviewBlock>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-surface shadow-[0_12px_32px_-4px_rgba(19,27,46,0.08)]">
          <div className="h-52 bg-linear-135 from-primary-hover via-primary to-secondary/80" />
          <CardHeader>
            <CardActionBadge />
            <CardTitle>Curadoria HUB Elite</CardTitle>
            <CardDescription>
              Uma peca exclusiva selecionada para o ecossistema premium Hub44.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm text-foreground-subtle">Preco sugerido</span>
            <span className="font-heading text-xl font-semibold text-primary">R$ 499,00</span>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              Ver detalhes
              <ArrowRight className="size-4" />
            </Button>
          </CardFooter>
        </Card>

        <div className="rounded-3xl bg-surface-alt p-5">
          <Dialog>
            <DialogTrigger render={<Button className="mb-4 w-full" />}>
              Abrir confirmacao de pedido
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmacao de pedido</DialogTitle>
                <DialogDescription>
                  Seu item de curadoria esta pronto para envio. Deseja seguir com
                  a confirmacao da reserva?
                </DialogDescription>
              </DialogHeader>
              <Progress value={72}>
                <ProgressLabel>Conferencia de estoque</ProgressLabel>
                <ProgressValue />
              </Progress>
              <DialogFooter>
                <Button className="w-full sm:w-auto">Confirmar</Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="space-y-4 rounded-2xl bg-surface p-4">
            <Progress value={85}>
              <ProgressLabel>Regional Sao Paulo</ProgressLabel>
              <ProgressValue />
            </Progress>
            <Progress value={62}>
              <ProgressLabel>Minas Gerais</ProgressLabel>
              <ProgressValue />
            </Progress>
            <Progress value={44}>
              <ProgressLabel>Parana</ProgressLabel>
              <ProgressValue />
            </Progress>
          </div>

          <div className="mt-5 flex items-center justify-center rounded-2xl bg-surface p-3">
            <nav className="flex w-full max-w-sm items-center justify-around rounded-full bg-surface-alt p-2">
              <IconButton icon={Home} active />
              <IconButton icon={Search} />
              <IconButton icon={UserRound} />
            </nav>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            <RoundAction icon={BadgeCheck} tone="primary" />
            <RoundAction icon={PencilLine} tone="secondary" />
            <RoundAction icon={Trash2} tone="error" />
          </div>
        </div>
      </section>
    </main>
  )
}

type PreviewBlockProps = {
  title: string
  description: string
  children: ReactNode
}

function PreviewBlock({ title, description, children }: PreviewBlockProps) {
  return (
    <article className="rounded-2xl bg-surface p-4 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
      <p className="mb-4 text-sm text-foreground-subtle">{description}</p>
      {children}
    </article>
  )
}

function CardActionBadge() {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      Destaque
    </span>
  )
}

function IconButton({
  icon: Icon,
  active = false,
}: {
  icon: ComponentType<{ className?: string }>
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={`grid size-10 place-items-center rounded-full transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-foreground-subtle hover:bg-surface'
      }`}
    >
      <Icon className="size-4" />
    </button>
  )
}

function RoundAction({
  icon: Icon,
  tone,
}: {
  icon: ComponentType<{ className?: string }>
  tone: 'primary' | 'secondary' | 'error'
}) {
  const className = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    error: 'bg-error text-white',
  }[tone]

  return (
    <button
      type="button"
      className={`grid size-10 place-items-center rounded-full ${className}`}
    >
      <Icon className="size-4" />
    </button>
  )
}
