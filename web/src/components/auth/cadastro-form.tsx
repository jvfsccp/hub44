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
import { register } from '@/lib/auth'

const cadastroSchema = z
  .object({
    name: z.string().trim().min(3, 'O nome precisa ter ao menos 3 caracteres.'),
    email: z.string().trim().email('Digite um e-mail valido.'),
    phone: z
      .string()
      .trim()
      .refine(
        (phone) => phone.replace(/\D/g, '').length >= 10,
        'Informe um telefone valido com DDD.',
      ),
    password: z.string().min(8, 'A senha deve ter no minimo 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas nao conferem.',
    path: ['confirmPassword'],
  })

type CadastroFormData = z.infer<typeof cadastroSchema>
type ProfileType = 'cliente' | 'lojista'

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits ? `(${digits}` : ''
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function CadastroForm() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileType>('cliente')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const form = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      setFeedback('Conta criada com sucesso. Redirecionando para o login...')
      setTimeout(() => {
        navigate({ to: '/login' })
      }, 900)
    },
    onError: (error) => {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel criar sua conta. Tente novamente.',
      )
    },
  })

  function handleSubmit(data: CadastroFormData) {
    setFeedback(null)

    if (profile === 'lojista') {
      setFeedback(
        'O cadastro de lojista ainda sera liberado no fluxo de onboarding.',
      )
      return
    }

    registerMutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    })
  }

  const errors = form.formState.errors
  const isLoading = registerMutation.isPending
  const phoneField = form.register('phone')

  return (
    <form
      className="flex flex-col"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <div className="mb-6 grid gap-2">
        <Label className="text-foreground-subtle">Perfil</Label>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-alt p-1">
          <Button
            type="button"
            variant={profile === 'cliente' ? 'default' : 'outline'}
            className="h-10 rounded-lg"
            onClick={() => setProfile('cliente')}
          >
            Cliente
          </Button>
          <Button
            type="button"
            variant={profile === 'lojista' ? 'default' : 'outline'}
            className="h-10 rounded-lg"
            onClick={() => setProfile('lojista')}
          >
            Lojista
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="cadastro-name" className="text-foreground-subtle">
            Nome completo
          </Label>
          <Input
            id="cadastro-name"
            type="text"
            placeholder="Ex: Maria Silva"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...form.register('name')}
          />
          {errors.name?.message ? (
            <p className="text-sm text-error">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cadastro-email" className="text-foreground-subtle">
            E-mail
          </Label>
          <Input
            id="cadastro-email"
            type="email"
            placeholder="voce@empresa.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...form.register('email')}
          />
          {errors.email?.message ? (
            <p className="text-sm text-error">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cadastro-phone" className="text-foreground-subtle">
            Telefone
          </Label>
          <Input
            id="cadastro-phone"
            type="tel"
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...phoneField}
            onChange={(event) => {
              form.setValue('phone', formatPhone(event.target.value), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          />
          {errors.phone?.message ? (
            <p className="text-sm text-error">{errors.phone.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cadastro-password" className="text-foreground-subtle">
            Senha
          </Label>
          <Input
            id="cadastro-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Crie uma senha"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
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

            {errors.password?.message ? (
              <p className="text-right text-sm text-error">
                {errors.password.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="cadastro-confirm-password"
            className="text-foreground-subtle"
          >
            Confirmar senha
          </Label>
          <Input
            id="cadastro-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repita a senha"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...form.register('confirmPassword')}
          />
          <div className="flex items-start justify-between gap-4">
            <Button
              type="button"
              variant="link"
              className="h-auto w-fit p-0 text-xs"
              onClick={() => setShowConfirmPassword((value) => !value)}
            >
              {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
              {showConfirmPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>

            {errors.confirmPassword?.message ? (
              <p className="text-right text-sm text-error">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {feedback ? (
        <div className="mt-5 rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
          {feedback}
        </div>
      ) : null}

      <Button
        type="submit"
        variant="secondary"
        className="mt-6 h-12 w-full text-base"
        disabled={!form.formState.isValid || isLoading}
      >
        {isLoading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>
    </form>
  )
}
