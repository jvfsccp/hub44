import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesCombined,
  Compass,
  LayoutDashboard,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

const buyerBenefits = [
  {
    title: 'Curadoria premium',
    description:
      'Selecionamos confecoes e marcas que traduzem o melhor da moda nacional com qualidade e consistencia.',
    icon: BadgeCheck,
    tone: 'bg-primary/10 text-primary',
  },
  {
    title: 'Preco de atacado',
    description:
      'Acesso direto ao maior polo de moda do Brasil com margem mais saudavel para compra e revenda.',
    icon: Store,
    tone: 'bg-secondary/20 text-secondary-foreground',
  },
  {
    title: 'Entrega garantida',
    description:
      'Logistica integrada para pedidos chegarem com seguranca em qualquer regiao do pais.',
    icon: Truck,
    tone: 'bg-primary/10 text-primary',
  },
]

const sellerHighlights = [
  {
    title: 'Visibilidade nacional',
    description:
      'Sua loja aberta 24/7 para compradores de todo o Brasil, sem depender apenas do fluxo presencial.',
    icon: Rocket,
  },
  {
    title: 'Gestao simplificada',
    description:
      'Pedidos, estoque e operacao reunidos em um fluxo unico, desenhado para escalar com menos atrito.',
    icon: LayoutDashboard,
  },
  {
    title: 'Crescimento regional',
    description:
      'Fortalece a identidade da Regiao da 44 enquanto amplia o alcance comercial do seu negocio.',
    icon: ChartNoAxesCombined,
  },
]

const navItems = [
  { label: 'Marketplace', href: '#compradores' },
  { label: 'Para lojistas', href: '#lojistas' },
  { label: 'Acesso', href: '#acesso' },
  { label: 'Contato', href: '#rodape' },
]

export function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-full bg-surface/85 px-4 py-3 shadow-[0_12px_32px_-12px_rgba(19,27,46,0.18)] backdrop-blur-xl sm:px-6">
          <a href="#topo" className="font-heading text-xl font-bold tracking-tight text-primary sm:text-2xl">
            HUB 44
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-foreground-subtle lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="transition-colors hover:text-primary">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#acesso"
              className={buttonVariants({
                variant: 'ghost',
                className: 'hidden sm:inline-flex',
              })}
            >
              Login
            </a>
            <a
              href="#acesso"
              className={buttonVariants({
                variant: 'default',
                size: 'lg',
                className: 'h-10 rounded-full px-5 text-sm',
              })}
            >
              Criar conta
            </a>
          </div>
        </div>
      </header>

      <section
        id="topo"
        className="relative overflow-hidden bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-alt)_72%,white)_0%,var(--background)_44%,var(--surface)_100%)] pt-28 sm:pt-32"
      >
        <div className="pointer-events-none absolute top-0 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 left-[-8%] h-[24rem] w-[24rem] rounded-full bg-secondary/12 blur-3xl" />

        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-20 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-10 lg:pb-24">
          <div className="relative z-10 space-y-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Compass className="size-4" />
              O marketplace editorial da Regiao da 44
            </span>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-heading text-5xl leading-[1.02] font-bold tracking-[-0.04em] text-primary sm:text-6xl lg:text-7xl">
                O coracao da moda nacional, <span className="text-secondary">agora digital.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-foreground-subtle sm:text-xl">
                A homepage do Hub44 apresenta a plataforma que conecta compradores,
                lojistas e operacao em uma experiencia premium. O login unico sera a
                porta de entrada para liberar cada jornada de acordo com a role e as
                permissoes de quem acessar.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#compradores"
                className={buttonVariants({
                  variant: 'default',
                  size: 'lg',
                  className: 'h-[3.25rem] rounded-2xl px-7 text-base',
                })}
              >
                Explorar marketplace
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#lojistas"
                className={buttonVariants({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'h-[3.25rem] rounded-2xl px-7 text-base',
                })}
              >
                Seja um lojista
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] shadow-[0_32px_80px_-28px_rgba(19,27,46,0.35)] transition-transform duration-500 hover:rotate-0 lg:rotate-2">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8-smf1AU_9D990gGDEIVWBMo7N8QdcDqApv2qwxR32P8N86ge-dO4ox8LwVXOQYiNFR9wrMjdu372C5WlJnRCC4049u8Pvo_HsFu8JaRDaieypcPn76IeeUbxOnyXQ0Osjq3ONU2ogTXFwZ0DlSOQGggRw-kC1TQ8XzWsMJwThtaLKrbR-Y0gnlb_KaGitrNIwMhLekj2WH8glCivxR-2J7yJ5wau9NWM6Jwd_VWGQFK8tG1ppyi9Q2waKnbz9MoPZxLwdv6h-mzC"
                alt="Editorial de moda moderna"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -left-10 bottom-10 max-w-xs rounded-[1.75rem] bg-surface p-6 shadow-[0_24px_40px_-22px_rgba(19,27,46,0.32)]">
              <p className="font-heading text-2xl leading-tight font-semibold text-primary">
                + de 500 marcas exclusivas da Regiao da 44 ao seu alcance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="compradores" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 sm:px-8 lg:px-10">
          <div className="space-y-4">
            <span className="text-sm font-bold tracking-[0.28em] text-secondary uppercase">
              Especial para voce
            </span>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="max-w-2xl font-heading text-4xl font-bold tracking-[-0.03em] text-primary sm:text-5xl">
                Experiencia unica de compra com curadoria e confianca.
              </h2>
              <p className="max-w-xl text-base leading-7 text-foreground-subtle">
                A landing apresenta o Hub44 como porta de entrada para descobrir
                marcas, comprar no varejo ou atacado e negociar com mais clareza.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {buyerBenefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <article
                  key={benefit.title}
                  className="rounded-[1.75rem] bg-surface-raised p-8 shadow-[0_14px_36px_-24px_rgba(19,27,46,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-22px_rgba(19,27,46,0.24)]"
                >
                  <div className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${benefit.tone}`}>
                    <Icon className="size-7" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-foreground-subtle">
                    {benefit.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="lojistas" className="overflow-hidden bg-surface-alt py-20 sm:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-10">
          <div className="order-2 grid grid-cols-2 gap-4 lg:order-1">
            <div className="space-y-4 pt-10">
              <div className="aspect-square overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_-24px_rgba(19,27,46,0.22)]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLSysqsT932RwTRp_Xpta7WSrfSsBuIaUmPUI5oPhJ_4aqqwQZW_9zg9ohiXWH6SJRW3F_KSqQqynCqgjlM7MldlXvCoooQYU2iyj-P0ZeXXsZoc5X8_q8rer7L1BFabLQfeTk1StcpQ0x_hJxB6BV8cApMr3C_XsQUCL7Fyj0MES0AnmVEGYy1FyzqZJt2EA7oaVLVLpRafg6ec2YEQ0WWyUFqqhRh-oeQkMI2PvQkOjgLk8VHXmZd3o2HN5gSeehX1yKKfQKxIzZ"
                  alt="Loja moderna da Regiao da 44"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="rounded-[1.75rem] bg-primary p-6 text-primary-foreground shadow-[0_16px_32px_-20px_rgba(29,78,137,0.55)]">
                <p className="font-heading text-4xl font-bold">10x</p>
                <p className="mt-1 text-sm leading-6 text-primary-foreground/80">
                  aumento medio de visibilidade para lojistas prontos para operar no digital
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_-24px_rgba(19,27,46,0.22)]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQnfUI8p56bh4TpFrINttt_R5ccv-LJv7reouN-Jg_AVHb_jj5tS_gxeiXYRwgAJrY9NbH1a4wCGJ9uWKqiLI2HA7XhnJW-x6QnkACn5ga_BBEFE13ffkzR2A5l3vb1gn123P8jDezYRhv2AFZURAw7ZBjWxL4UuXTsaKvPQYpYzI7d5OubsNkB7whwAY0j1147av1oSI09cL2p18YMNXCCguZrJShK2u99T7oUQhBHOkbMc1iJUcF5ZyTft36cy4ebdrRM6t92RWw"
                  alt="Tecnologia aplicada ao varejo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="order-1 space-y-7 lg:order-2">
            <span className="text-sm font-bold tracking-[0.28em] text-secondary uppercase">
              Venda mais, gerencie melhor
            </span>
            <h2 className="max-w-3xl font-heading text-4xl font-bold tracking-[-0.03em] text-primary sm:text-5xl">
              Digitalize sua loja da 44 e ganhe o Brasil com uma operacao pensada para crescer.
            </h2>

            <div className="space-y-5">
              {sellerHighlights.map((item) => {
                const Icon = item.icon

                return (
                  <article key={item.title} className="flex gap-4 rounded-[1.5rem] bg-surface/75 p-5">
                      <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-primary">{item.title}</h3>
                      <p className="mt-2 text-base leading-7 text-foreground-subtle">
                        {item.description}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            <a
              href="#acesso"
              className={buttonVariants({
                variant: 'default',
                size: 'lg',
                className: 'h-[3.25rem] rounded-2xl px-7 text-base',
              })}
            >
              Quero digitalizar meu negocio
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section id="acesso" className="bg-surface py-20 sm:py-24">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 sm:px-8 lg:px-10">
          <div className="space-y-4">
            <span className="text-sm font-bold tracking-[0.28em] text-secondary uppercase">
              Um unico acesso, multiplas jornadas
            </span>
            <h2 className="max-w-3xl font-heading text-4xl font-bold tracking-[-0.03em] text-primary sm:text-5xl">
              O login do Hub44 vai diferenciar papeis e permissoes sem quebrar a experiencia da homepage.
            </h2>
            <p className="max-w-3xl text-base leading-7 text-foreground-subtle">
              Nesta primeira versao da homepage, os CTAs ja posicionam o proximo passo:
              entrar, criar conta e encaminhar cada perfil para a experiencia correta quando a autenticacao for integrada.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <RoleCard
              imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuA923qj41cb8On376tt5uJ9_NcKVZylzy22VWoJi0qltBIY3ybwdTiZegiKeYJagnTfH-ZKi6veWzrVJbmVqaZXmyJBOVw0XwBGlVFTFogmO_zMM7BQdrNRQ1hkCaSuSiQ4muAegRr0VPSrOX3Wnn503jR2-LQCYe_AAOkhLi2DWONSqKPoNopmi4JWmJGgnrDA6-aFqHirlX9ztX55ylGzR27qTnbCyZgYN1bqbp915B7dmyGIcJ4RB7wWxDg2PSMz6kD_rlneBKkB"
              title="Sou cliente"
              description="Acesse marcas selecionadas, compre com clareza e acompanhe pedidos em uma experiencia orientada por curadoria."
              primaryAction="Fazer login"
              secondaryAction="Criar conta"
              overlayClassName="from-primary/90 via-primary/60 to-transparent"
              accentClassName="bg-white text-primary hover:bg-primary-foreground"
              icon={<PackageCheck className="size-5" />}
            />

            <RoleCard
              imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBPkxaapYJ7oySed21Qs6h2_O4quKWFNLuvD8EeSxxff2qDPs0vbFJniuEm3L472EN7RmFyqnltGjtED3SMPZsdRca3vYgechUv0nhk0jBA-aQNTneL06RWvv3fSYcSydkD2s1Fh4UMZ20yJ0JL0BZyKmmSFyqNC-3rhXc3g4HHAi3JOwKwaIVQHeyDQrX7WxpwhQ6p1G4SbXkRa-TVpWHzsZvaEjf7KztxXTtUqlgjr7CYfjzOJnpvas7V9t18E1KE6jUVtd2bqMLq"
              title="Sou lojista"
              description="Gerencie produtos, vendas e relacionamento com clientes em um painel que respeita sua role e suas permissoes."
              primaryAction="Acessar painel"
              secondaryAction="Ver duvidas frequentes"
              overlayClassName="from-secondary/95 via-secondary/60 to-transparent"
              accentClassName="bg-white text-secondary-foreground hover:bg-orange-50"
              icon={<ShieldCheck className="size-5" />}
            />
          </div>

          <div className="grid gap-4 rounded-[2rem] bg-surface-alt p-6 md:grid-cols-3">
            <AccessPill title="Login unico" description="Entrada central para compradores, lojistas e perfis internos." />
            <AccessPill title="Roles" description="Cada conta libera menus, dashboards e fluxos de acordo com o perfil." />
            <AccessPill title="Permissoes" description="Acoes sensiveis ficam restritas conforme o nivel de acesso configurado." />
          </div>
        </div>
      </section>

      <footer id="rodape" className="bg-surface-alt pb-8 pt-16">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 sm:px-8 md:grid-cols-4 lg:px-10">
          <div className="space-y-5">
            <div className="font-heading text-2xl font-bold tracking-tight text-primary">HUB 44</div>
            <p className="text-sm leading-7 text-foreground-subtle">
              A plataforma que digitaliza a tradicao da Regiao da 44 e conecta moda,
              operacao e crescimento em escala nacional.
            </p>
          </div>

          <FooterColumn
            title="Navegacao"
            items={[
              { label: 'Marketplace', href: '#compradores' },
              { label: 'Central do vendedor', href: '#lojistas' },
              { label: 'Acesso e perfis', href: '#acesso' },
            ]}
          />

          <FooterColumn
            title="Suporte"
            items={[
              { label: 'Politica de privacidade', href: '#' },
              { label: 'Termos de uso', href: '#' },
              { label: 'Guia do lojista', href: '#' },
            ]}
          />

          <FooterColumn
            title="Contato"
            items={[
              { label: 'contato@hub44.com.br', href: 'mailto:contato@hub44.com.br' },
              { label: '(62) 4444-4444', href: 'tel:+556244444444' },
              { label: 'Preview de componentes', to: '/components-preview' },
            ]}
          />
        </div>

        <div className="mx-auto mt-14 w-full max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
          <p className="pt-8 text-center text-sm text-foreground-subtle">
            © 2026 HUB 44. Homepage institucional com base no Stitch e preparada para fluxo de autenticacao por roles.
          </p>
        </div>
      </footer>
    </main>
  )
}

type RoleCardProps = {
  imageUrl: string
  title: string
  description: string
  primaryAction: string
  secondaryAction: string
  overlayClassName: string
  accentClassName: string
  icon: ReactNode
}

function RoleCard({
  imageUrl,
  title,
  description,
  primaryAction,
  secondaryAction,
  overlayClassName,
  accentClassName,
  icon,
}: RoleCardProps) {
  return (
    <article className="group relative min-h-[26rem] overflow-hidden rounded-[2rem]">
      <img src={imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 bg-gradient-to-t ${overlayClassName}`} />
      <div className="relative flex h-full flex-col justify-end p-8 text-white sm:p-10">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/14 px-3 py-2 text-sm font-semibold backdrop-blur-sm">
          {icon}
          Role dedicada
        </div>
        <h3 className="font-heading text-3xl font-bold">{title}</h3>
        <p className="mt-4 max-w-md text-base leading-7 text-white/90">{description}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="button" className={`rounded-xl px-6 py-3 font-semibold transition-colors ${accentClassName}`}>
            {primaryAction}
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
          >
            {secondaryAction}
          </button>
        </div>
      </div>
    </article>
  )
}

function AccessPill({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[1.5rem] bg-surface p-5 shadow-[0_12px_28px_-24px_rgba(19,27,46,0.22)]">
      <p className="font-heading text-lg font-semibold text-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-foreground-subtle">{description}</p>
    </article>
  )
}

function FooterColumn({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; href?: string; to?: '/components-preview' }>
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-heading text-lg font-semibold text-primary">{title}</h4>
      <nav className="flex flex-col gap-3 text-sm text-foreground-subtle">
        {items.map((item) =>
          item.to ? (
            <Link key={item.label} to={item.to} className="transition-colors hover:text-primary hover:underline">
              {item.label}
            </Link>
          ) : (
            <a key={item.label} href={item.href} className="transition-colors hover:text-primary hover:underline">
              {item.label}
            </a>
          )
        )}
      </nav>
    </div>
  )
}
