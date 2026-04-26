import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getEmailError(email: string) {
  if (!email.trim()) {
    return 'Informe seu e-mail.'
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Digite um e-mail válido.'
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

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const emailError = useMemo(() => getEmailError(email), [email])
  const passwordError = useMemo(() => getPasswordError(password), [password])
  const isFormValid = !emailError && !passwordError

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailTouched(true)
    setPasswordTouched(true)
    setError(null)

    if (!isFormValid) {
      return
    }

    setLoading(true)

    await new Promise((resolve) => {
      setTimeout(resolve, 1200)
    })

    setLoading(false)
    setError('Autenticacao ainda nao conectada ao backend.')
  }

  return (
  <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
    <div className="flex flex-col gap-7">
      <div className="grid gap-2">
        <Label htmlFor="login-email" className="text-foreground-subtle">
          E-mail
        </Label>

        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="voce@empresa.com"
          autoComplete="email"
          aria-invalid={emailTouched && !!emailError}
        />

        {emailTouched && emailError ? (
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
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setPasswordTouched(true)}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          aria-invalid={passwordTouched && !!passwordError}
        />

        <div className="flex items-start justify-between gap-4">
          <Button
            type="button"
            variant="link"
            className="h-auto w-fit p-0 text-xs"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>

          {passwordTouched && passwordError ? (
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
      disabled={!isFormValid || loading}
    >
      {loading ? (
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
