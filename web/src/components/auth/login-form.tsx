import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { login } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().trim().email('Digite um e-mail valido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

type LoginFormData = z.infer<typeof loginSchema>
type AccountType = 'cliente' | 'lojista'

export function LoginForm() {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState<AccountType>('cliente')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      if (accountType === 'lojista' && user.role === 'customer') {
        setError('Esta conta nao possui acesso de lojista.')
        return
      }

      navigate({
        to:
          user.role === 'seller' || user.role === 'admin'
            ? '/lojista/dashboard'
            : '/marketplace',
      })
    },
    onError: (error) => {
      setError(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel entrar. Tente novamente.',
      )
    },
  })

  function handleSubmit(data: LoginFormData) {
    setError(null)
    loginMutation.mutate(data)
  }

  const emailError = form.formState.errors.email?.message
  const passwordError = form.formState.errors.password?.message
  const isLoading = loginMutation.isPending

  return (
    <form
      className="flex flex-col"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <div className="mb-6 grid gap-2">
        <Label className="text-foreground-subtle">Tipo de acesso</Label>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-alt p-1">
          <Button
            type="button"
            variant={accountType === 'cliente' ? 'default' : 'outline'}
            className="h-10 rounded-lg"
            onClick={() => setAccountType('cliente')}
          >
            Cliente
          </Button>
          <Button
            type="button"
            variant={accountType === 'lojista' ? 'default' : 'outline'}
            className="h-10 rounded-lg"
            onClick={() => setAccountType('lojista')}
          >
            Lojista
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-7">
        <div className="grid gap-2">
          <Label htmlFor="login-email" className="text-foreground-subtle">
            E-mail
          </Label>

          <Input
            id="login-email"
            type="email"
            placeholder="voce@empresa.com"
            autoComplete="email"
            aria-invalid={!!emailError}
            {...form.register('email')}
          />

          {emailError ? (
            <p
              className="text-sm text-error"
              style={{ width: '100%', textAlign: 'right' }}
            >
              {emailError}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="login-password" className="text-foreground-subtle">
            Senha
          </Label>

          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            {...form.register('password')}
          />

          <div className="flex items-start justify-between gap-4">
            <Button
              type="button"
              variant="link"
              className="h-auto w-fit p-0 text-xs"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
              {showPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>

            {passwordError ? (
              <p className="text-right text-sm text-error">{passwordError}</p>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        className="mt-7 h-12 w-full text-base shadow-[0_10px_24px_-12px_rgba(29,78,137,0.9)]"
        disabled={!form.formState.isValid || isLoading}
      >
        {isLoading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}
