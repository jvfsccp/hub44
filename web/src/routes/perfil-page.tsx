import { Link } from '@tanstack/react-router'
import { Mail, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [fullName, setFullName] = useState('Mariana Costa')
  const [email, setEmail] = useState('mariana.costa@hub44.com')
  const [phone, setPhone] = useState('(62) 99999-3321')
  const [cpf, setCpf] = useState('123.456.789-00')

  const [cep, setCep] = useState('74000-000')
  const [street, setStreet] = useState('Rua das Confecções')
  const [number, setNumber] = useState('144')
  const [city, setCity] = useState('Goiânia')
  const [state, setState] = useState('GO')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [newsletter, setNewsletter] = useState(true)
  const [promotions, setPromotions] = useState(false)

  function handleEdit() {
    setIsEditing(true)
    setFeedback(null)
  }

  function handleSave() {
    setIsEditing(false)
    setFeedback('Alterações salvas localmente com sucesso.')
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
              <UserRound className="size-7" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{fullName}</h1>
              <p className="text-sm text-foreground-subtle sm:text-base">{email}</p>
              <p className="mt-1 text-sm text-foreground-subtle">Gerencie seus dados e preferências da conta.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handleEdit} disabled={isEditing}>
              Editar
            </Button>
            <Button type="button" onClick={handleSave} disabled={!isEditing}>
              Salvar alterações
            </Button>
          </div>
        </header>

        {feedback ? (
          <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">{feedback}</div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Dados pessoais</CardTitle>
              <CardDescription>Informações básicas do seu perfil</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field label="Nome completo" value={fullName} onChange={setFullName} disabled={!isEditing} />
              <Field label="Email" value={email} onChange={setEmail} disabled={!isEditing} />
              <Field label="Telefone" value={phone} onChange={setPhone} disabled={!isEditing} />
              <Field label="CPF" value={cpf} onChange={setCpf} disabled={!isEditing} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Endereço</CardTitle>
              <CardDescription>Local de entrega padrão</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field label="CEP" value={cep} onChange={setCep} disabled={!isEditing} />
              <Field label="Rua" value={street} onChange={setStreet} disabled={!isEditing} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Número" value={number} onChange={setNumber} disabled={!isEditing} />
                <div className="sm:col-span-2">
                  <Field label="Cidade" value={city} onChange={setCity} disabled={!isEditing} />
                </div>
              </div>
              <Field label="Estado" value={state} onChange={setState} disabled={!isEditing} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Atualize suas credenciais</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field label="Senha atual" value={currentPassword} onChange={setCurrentPassword} disabled={!isEditing} type="password" />
              <Field label="Nova senha" value={newPassword} onChange={setNewPassword} disabled={!isEditing} type="password" />
              <Field label="Confirmar senha" value={confirmPassword} onChange={setConfirmPassword} disabled={!isEditing} type="password" />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Preferências</CardTitle>
              <CardDescription>Comunicações e novidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              <PreferenceRow
                label="Notificações por email"
                description="Atualizações de pedidos e movimentações"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={!isEditing}
              />
              <PreferenceRow
                label="Newsletter"
                description="Novidades do Hub44 e tendências"
                checked={newsletter}
                onCheckedChange={setNewsletter}
                disabled={!isEditing}
              />
              <PreferenceRow
                label="Promoções"
                description="Ofertas e campanhas personalizadas"
                checked={promotions}
                onCheckedChange={setPromotions}
                disabled={!isEditing}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">
                  <Mail className="size-3.5" />
                  Perfil ativo
                </Badge>
                <Badge variant="outline">
                  <MapPin className="size-3.5" />
                  Endereço validado
                </Badge>
                <Badge variant="outline">
                  <ShieldCheck className="size-3.5" />
                  Segurança em dia
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-right">
          <Button variant="ghost" render={<Link to="/marketplace" />}>
            Voltar ao marketplace
          </Button>
        </div>
      </section>
    </main>
  )
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
  type?: 'text' | 'password'
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
    </div>
  )
}

function PreferenceRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
  disabled: boolean
}) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-xl bg-surface-alt/70 px-3 py-2">
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs text-foreground-subtle">{description}</span>
      </span>
      <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(Boolean(value))} disabled={disabled} />
    </label>
  )
}
