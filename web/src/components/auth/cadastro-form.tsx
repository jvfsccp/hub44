import { LoaderCircle } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ProfileType = 'cliente' | 'lojista'

function getNameError(name: string) {
  if (!name.trim()) {
    return 'Informe seu nome completo.'
  }

  if (name.trim().length < 3) {
    return 'O nome precisa ter ao menos 3 caracteres.'
  }

  return ''
}

function getEmailError(email: string) {
  if (!email.trim()) {
    return 'Informe seu e-mail.'
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Digite um e-mail valido.'
  }

  return ''
}

function getPasswordError(password: string) {
  if (!password) {
    return 'Informe sua senha.'
  }

  if (password.length < 6) {
    return 'A senha deve ter no minimo 6 caracteres.'
  }

  return ''
}

function getConfirmPasswordError(password: string, confirmPassword: string) {
  if (!confirmPassword) {
    return 'Confirme sua senha.'
  }

  if (password !== confirmPassword) {
    return 'As senhas nao conferem.'
  }

  return ''
}

export function CadastroForm() {
  const [profile, setProfile] = useState<ProfileType>('cliente')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [nameTouched, setNameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)

  const nameError = useMemo(() => getNameError(name), [name])
  const emailError = useMemo(() => getEmailError(email), [email])
  const passwordError = useMemo(() => getPasswordError(password), [password])
  const confirmPasswordError = useMemo(
    () => getConfirmPasswordError(password, confirmPassword),
    [password, confirmPassword],
  )

  const isFormValid = !nameError && !emailError && !passwordError && !confirmPasswordError

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setNameTouched(true)
    setEmailTouched(true)
    setPasswordTouched(true)
    setConfirmPasswordTouched(true)
    setFeedback(null)

    if (!isFormValid) {
      return
    }

    setLoading(true)

    await new Promise((resolve) => {
      setTimeout(resolve, 1200)
    })

    setLoading(false)
    setFeedback(`Cadastro de ${profile} pronto na interface, aguardando integracao com backend.`)
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setNameTouched(true)}
            placeholder="Ex: Maria Silva"
            autoComplete="name"
            aria-invalid={nameTouched && !!nameError}
          />
          {nameTouched && nameError ? <p className="text-sm text-error">{nameError}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cadastro-email" className="text-foreground-subtle">
            E-mail
          </Label>
          <Input
            id="cadastro-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="voce@empresa.com"
            autoComplete="email"
            aria-invalid={emailTouched && !!emailError}
          />
          {emailTouched && emailError ? <p className="text-sm text-error">{emailError}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cadastro-password" className="text-foreground-subtle">
            Senha
          </Label>
          <Input
            id="cadastro-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => setPasswordTouched(true)}
            placeholder="Crie uma senha"
            autoComplete="new-password"
            aria-invalid={passwordTouched && !!passwordError}
          />
          {passwordTouched && passwordError ? <p className="text-sm text-error">{passwordError}</p> : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cadastro-confirm-password" className="text-foreground-subtle">
            Confirmar senha
          </Label>
          <Input
            id="cadastro-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={() => setConfirmPasswordTouched(true)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            aria-invalid={confirmPasswordTouched && !!confirmPasswordError}
          />
          {confirmPasswordTouched && confirmPasswordError ? (
            <p className="text-sm text-error">{confirmPasswordError}</p>
          ) : null}
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
        disabled={!isFormValid || loading}
      >
        {loading ? (
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
