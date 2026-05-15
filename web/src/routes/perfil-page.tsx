import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Mail, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  addressQueryKeys,
  createAddress,
  listAddresses,
  updateAddress,
} from '@/lib/addresses'
import { ApiError, getAccessToken } from '@/lib/api'
import {
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  userQueryKeys,
} from '@/lib/users'

type ProfileForm = {
  name: string
  email: string
  phone: string
  cpf: string
  emailNotifications: boolean
  newsletter: boolean
  promotions: boolean
}

type AddressForm = {
  recipient: string
  zipCode: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
}

const emptyProfile: ProfileForm = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  emailNotifications: true,
  newsletter: true,
  promotions: false,
}

const emptyAddress: AddressForm = {
  recipient: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
}

export function PerfilPage() {
  const queryClient = useQueryClient()
  const hasToken = Boolean(getAccessToken())
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile)
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const profileQuery = useQuery({
    queryKey: userQueryKeys.profile,
    queryFn: getUserProfile,
    enabled: hasToken,
  })
  const addressesQuery = useQuery({
    queryKey: addressQueryKeys.all,
    queryFn: listAddresses,
    enabled: hasToken,
  })
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
  })
  const createAddressMutation = useMutation({
    mutationFn: createAddress,
  })
  const updateAddressMutation = useMutation({
    mutationFn: updateAddress,
  })
  const updatePasswordMutation = useMutation({
    mutationFn: updateUserPassword,
  })

  const user = profileQuery.data?.user
  const primaryAddress = useMemo(() => {
    const addresses = addressesQuery.data?.addresses ?? []

    return (
      addresses.find((address) => address.isPrimary) ?? addresses[0] ?? null
    )
  }, [addressesQuery.data?.addresses])
  const isSaving =
    updateProfileMutation.isPending ||
    createAddressMutation.isPending ||
    updateAddressMutation.isPending ||
    updatePasswordMutation.isPending

  useEffect(() => {
    if (!user || isEditing) {
      return
    }

    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      cpf: user.cpf ?? '',
      emailNotifications: user.emailNotifications,
      newsletter: user.newsletter,
      promotions: user.promotions,
    })
  }, [isEditing, user])

  useEffect(() => {
    if (isEditing) {
      return
    }

    if (!primaryAddress) {
      setAddressForm(emptyAddress)
      return
    }

    setAddressForm({
      recipient: primaryAddress.recipient ?? '',
      zipCode: primaryAddress.zipCode,
      street: primaryAddress.street,
      number: primaryAddress.number,
      complement: primaryAddress.complement ?? '',
      district: primaryAddress.district,
      city: primaryAddress.city,
      state: primaryAddress.state,
    })
  }, [isEditing, primaryAddress])

  function handleEdit() {
    setIsEditing(true)
    setFeedback(null)
  }

  async function handleSave() {
    setFeedback(null)

    if (newPassword || currentPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setFeedback('A nova senha e a confirmacao nao conferem.')
        return
      }

      if (newPassword.length < 8) {
        setFeedback('A nova senha deve ter no minimo 8 caracteres.')
        return
      }
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null,
        cpf: profileForm.cpf.trim() || null,
        emailNotifications: profileForm.emailNotifications,
        newsletter: profileForm.newsletter,
        promotions: profileForm.promotions,
      })

      await saveAddressIfNeeded()

      if (newPassword || currentPassword || confirmPassword) {
        await updatePasswordMutation.mutateAsync({
          currentPassword,
          newPassword,
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.profile }),
        queryClient.invalidateQueries({ queryKey: addressQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['auth'] }),
      ])

      setIsEditing(false)
      setFeedback('Alteracoes salvas com sucesso.')
    } catch (error) {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Nao foi possivel salvar o perfil.',
      )
    }
  }

  async function saveAddressIfNeeded() {
    const addressPayload = {
      recipient: addressForm.recipient.trim() || profileForm.name.trim(),
      zipCode: addressForm.zipCode.replace(/\D/g, ''),
      street: addressForm.street.trim(),
      number: addressForm.number.trim(),
      complement: addressForm.complement.trim() || null,
      district: addressForm.district.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim().toUpperCase(),
      isPrimary: true,
    }
    const hasAnyAddressField = Object.values(addressForm).some((value) =>
      value.trim(),
    )

    if (!hasAnyAddressField && !primaryAddress) {
      return
    }

    if (
      !addressPayload.zipCode ||
      !addressPayload.street ||
      !addressPayload.number ||
      !addressPayload.district ||
      !addressPayload.city ||
      addressPayload.state.length !== 2
    ) {
      throw new Error('Preencha todos os campos obrigatorios do endereco.')
    }

    if (primaryAddress) {
      await updateAddressMutation.mutateAsync({
        id: primaryAddress.id,
        ...addressPayload,
      })
      return
    }

    await createAddressMutation.mutateAsync(addressPayload)
  }

  if (!hasToken) {
    return (
      <main className="grid min-h-[calc(100vh-92px)] place-items-center px-6 py-10">
        <Card className="w-full max-w-lg rounded-2xl py-0">
          <CardContent className="px-6 py-8 text-center">
            <UserRound className="mx-auto mb-3 size-7 text-foreground-subtle" />
            <p className="font-medium text-foreground">
              Entre para acessar seu perfil.
            </p>
            <Button className="mt-4" render={<Link to="/login" />}>
              Fazer login
            </Button>
          </CardContent>
        </Card>
      </main>
    )
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
              <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                {profileQuery.isLoading
                  ? 'Carregando perfil...'
                  : profileForm.name || 'Meu perfil'}
              </h1>
              <p className="text-sm text-foreground-subtle sm:text-base">
                {profileForm.email}
              </p>
              <p className="mt-1 text-sm text-foreground-subtle">
                Gerencie seus dados e preferencias da conta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleEdit}
              disabled={isEditing || profileQuery.isLoading}
            >
              Editar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!isEditing || isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
            </Button>
          </div>
        </header>

        {profileQuery.error || addressesQuery.error ? (
          <div className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
            Nao foi possivel carregar todos os dados do perfil.
          </div>
        ) : null}

        {feedback ? (
          <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
            {feedback}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Dados pessoais</CardTitle>
              <CardDescription>
                Informacoes basicas do seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field
                label="Nome completo"
                value={profileForm.name}
                onChange={(name) =>
                  setProfileForm((current) => ({ ...current, name }))
                }
                disabled={!isEditing}
              />
              <Field
                label="Email"
                value={profileForm.email}
                onChange={(email) =>
                  setProfileForm((current) => ({ ...current, email }))
                }
                disabled={!isEditing}
              />
              <Field
                label="Telefone"
                value={profileForm.phone}
                onChange={(phone) =>
                  setProfileForm((current) => ({ ...current, phone }))
                }
                disabled={!isEditing}
              />
              <Field
                label="CPF"
                value={profileForm.cpf}
                onChange={(cpf) =>
                  setProfileForm((current) => ({ ...current, cpf }))
                }
                disabled={!isEditing}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Endereco</CardTitle>
              <CardDescription>Local de entrega principal</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field
                label="Destinatario"
                value={addressForm.recipient}
                onChange={(recipient) =>
                  setAddressForm((current) => ({ ...current, recipient }))
                }
                disabled={!isEditing}
              />
              <Field
                label="CEP"
                value={addressForm.zipCode}
                onChange={(zipCode) =>
                  setAddressForm((current) => ({ ...current, zipCode }))
                }
                disabled={!isEditing}
              />
              <Field
                label="Rua"
                value={addressForm.street}
                onChange={(street) =>
                  setAddressForm((current) => ({ ...current, street }))
                }
                disabled={!isEditing}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label="Numero"
                  value={addressForm.number}
                  onChange={(number) =>
                    setAddressForm((current) => ({ ...current, number }))
                  }
                  disabled={!isEditing}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Bairro"
                    value={addressForm.district}
                    onChange={(district) =>
                      setAddressForm((current) => ({ ...current, district }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Field
                    label="Cidade"
                    value={addressForm.city}
                    onChange={(city) =>
                      setAddressForm((current) => ({ ...current, city }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <Field
                  label="Estado"
                  value={addressForm.state}
                  onChange={(state) =>
                    setAddressForm((current) => ({ ...current, state }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <Field
                label="Complemento"
                value={addressForm.complement}
                onChange={(complement) =>
                  setAddressForm((current) => ({ ...current, complement }))
                }
                disabled={!isEditing}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Seguranca</CardTitle>
              <CardDescription>Atualize suas credenciais</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field
                label="Senha atual"
                value={currentPassword}
                onChange={setCurrentPassword}
                disabled={!isEditing}
                type="password"
              />
              <Field
                label="Nova senha"
                value={newPassword}
                onChange={setNewPassword}
                disabled={!isEditing}
                type="password"
              />
              <Field
                label="Confirmar senha"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={!isEditing}
                type="password"
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>Comunicacoes e novidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              <PreferenceRow
                label="Notificacoes por email"
                description="Atualizacoes de pedidos e movimentacoes"
                checked={profileForm.emailNotifications}
                onCheckedChange={(emailNotifications) =>
                  setProfileForm((current) => ({
                    ...current,
                    emailNotifications,
                  }))
                }
                disabled={!isEditing}
              />
              <PreferenceRow
                label="Newsletter"
                description="Novidades do Hub44 e tendencias"
                checked={profileForm.newsletter}
                onCheckedChange={(newsletter) =>
                  setProfileForm((current) => ({ ...current, newsletter }))
                }
                disabled={!isEditing}
              />
              <PreferenceRow
                label="Promocoes"
                description="Ofertas e campanhas personalizadas"
                checked={profileForm.promotions}
                onCheckedChange={(promotions) =>
                  setProfileForm((current) => ({ ...current, promotions }))
                }
                disabled={!isEditing}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">
                  <Mail className="size-3.5" />
                  Perfil ativo
                </Badge>
                <Badge variant="outline">
                  <MapPin className="size-3.5" />
                  {primaryAddress ? 'Endereco validado' : 'Sem endereco'}
                </Badge>
                <Badge variant="outline">
                  <ShieldCheck className="size-3.5" />
                  Seguranca em dia
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
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
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
    <div className="flex items-start justify-between gap-3 rounded-xl bg-surface-alt/70 px-3 py-2">
      <span>
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-foreground-subtle">
          {description}
        </span>
      </span>
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
        disabled={disabled}
      />
    </div>
  )
}
