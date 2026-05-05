import { Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'
import {
  Card,
  CardContent,
} from '@/components/ui/card'

export function LoginPage() {
  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 rounded-3xl bg-surface/80 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-subtle transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Voltar para a home
          </Link>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <ShieldCheck className="size-4" />
              Acesso seguro
            </span>
            <h1 className="font-heading text-4xl leading-tight font-bold text-foreground sm:text-5xl">
              Entre na sua conta
              <span className="block bg-linear-135 from-primary to-secondary bg-clip-text text-transparent">
                Hub44
              </span>
            </h1>
            <p className="max-w-lg mb-4 text-base leading-relaxed text-foreground-subtle">
              Gerencie pedidos, produtos e operacao comercial em uma interface
              editorial, clara e focada em produtividade.
            </p>
          </div>
        </div>

        <Card className="w-full max-w-[29rem] justify-self-center self-center rounded-3xl bg-surface-raised py-0 shadow-[0_12px_32px_-4px_rgba(19,27,46,0.08)] ring-1 ring-foreground/8">
          <CardContent className="p-6 md:p-7">
            <div className="mb-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                Login
              </h2>

              <p className="mt-2 mb-4 max-w-sm text-sm text-foreground-subtle">
                Preencha seus dados para acessar o painel.
              </p>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-sm text-foreground-subtle">
              Ainda nao tem uma conta?{' '}
              <Link to="/cadastro" className="font-semibold text-primary transition-colors hover:text-primary-hover">
                Criar conta
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
