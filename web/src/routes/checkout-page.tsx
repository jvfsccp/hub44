import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { CreditCard, MapPin, ReceiptText, Truck } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  type AddressInput,
  addressQueryKeys,
  createAddress,
  listAddresses,
  setPrimaryAddress,
} from '@/lib/addresses'
import { ApiError, getAccessToken } from '@/lib/api'
import { cartQueryKeys, getCart } from '@/lib/cart'
import { createOrderFromCart, type PaymentMethod } from '@/lib/orders'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const paymentOptions: Array<{ id: PaymentMethod; label: string }> = [
  { id: 'card', label: 'Cartao de credito' },
  { id: 'pix', label: 'PIX' },
  { id: 'boleto', label: 'Boleto' },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const hasToken = Boolean(getAccessToken())
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [newAddress, setNewAddress] = useState<AddressInput>({
    recipient: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    isPrimary: false,
  })

  const cartQuery = useQuery({
    queryKey: cartQueryKeys.detail(appliedCoupon ?? undefined),
    queryFn: () => getCart(appliedCoupon ?? undefined),
    enabled: hasToken,
  })
  const addressesQuery = useQuery({
    queryKey: addressQueryKeys.all,
    queryFn: listAddresses,
    enabled: hasToken,
  })
  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: ({ address }) => {
      setSelectedAddressId(address.id)
      setShowAddressForm(false)
      setNewAddress({
        recipient: '',
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        isPrimary: false,
      })
      queryClient.invalidateQueries({ queryKey: addressQueryKeys.all })
    },
    onError: handleMutationError,
  })
  const setPrimaryMutation = useMutation({
    mutationFn: setPrimaryAddress,
    onSuccess: ({ address }) => {
      setSelectedAddressId(address.id)
      queryClient.invalidateQueries({ queryKey: addressQueryKeys.all })
    },
    onError: handleMutationError,
  })
  const createOrderMutation = useMutation({
    mutationFn: createOrderFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all })
      navigate({ to: '/pedido/sucesso' })
    },
    onError: handleMutationError,
  })

  const cart = cartQuery.data
  const checkoutItems = cart?.items ?? []
  const summary = cart?.summary ?? {
    itemsCount: 0,
    subtotalInCents: 0,
    shippingInCents: 0,
    discountInCents: 0,
    totalInCents: 0,
    couponCode: null,
  }
  const addresses = useMemo(
    () => addressesQuery.data?.addresses ?? [],
    [addressesQuery.data?.addresses],
  )
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  )

  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) {
      return
    }

    const primaryAddress = addresses.find((address) => address.isPrimary)
    setSelectedAddressId(primaryAddress?.id ?? addresses[0].id)
  }, [addresses, selectedAddressId])

  function handleMutationError(error: unknown) {
    setFeedback(
      error instanceof ApiError
        ? error.message
        : 'Nao foi possivel concluir a operacao.',
    )
  }

  function applyCoupon() {
    const normalized = couponCode.trim().toUpperCase()

    if (normalized === 'HUB44') {
      setAppliedCoupon(normalized)
      setCouponFeedback('Cupom aplicado com sucesso.')
      return
    }

    setAppliedCoupon(null)
    setCouponFeedback('Cupom invalido.')
  }

  function addAddress() {
    if (
      !newAddress.recipient ||
      !newAddress.zipCode ||
      !newAddress.street ||
      !newAddress.number ||
      !newAddress.district ||
      !newAddress.city ||
      !newAddress.state
    ) {
      setFeedback('Preencha os campos obrigatorios do endereco.')
      return
    }

    setFeedback(null)
    createAddressMutation.mutate({
      ...newAddress,
      state: newAddress.state.trim().toUpperCase(),
      zipCode: newAddress.zipCode.replace(/\D/g, ''),
      complement: newAddress.complement || null,
    })
  }

  function handleFinalizeOrder() {
    if (!selectedAddress) {
      setFeedback('Selecione ou cadastre um endereco de entrega.')
      return
    }

    setFeedback(null)
    createOrderMutation.mutate({
      addressId: selectedAddress.id,
      paymentMethod,
      deliveryMethod: 'standard',
      couponCode: appliedCoupon,
    })
  }

  if (!hasToken) {
    return (
      <main className="grid min-h-[calc(100vh-92px)] place-items-center px-6 py-10">
        <Card className="w-full max-w-lg rounded-2xl py-0">
          <CardContent className="px-6 py-8 text-center">
            <ReceiptText className="mx-auto mb-3 size-7 text-foreground-subtle" />
            <p className="font-medium text-foreground">
              Entre para finalizar seu pedido.
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
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Finalizar pedido
          </h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Revise entrega, pagamento e itens ativos do carrinho.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Endereco de entrega</CardTitle>
                <CardDescription>Dados persistidos na API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5 text-sm">
                {addressesQuery.isLoading ? (
                  <div className="rounded-xl bg-surface-alt/70 p-3 text-foreground-subtle">
                    Carregando enderecos...
                  </div>
                ) : null}

                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    className={`w-full rounded-xl p-3 text-left transition-colors ${
                      selectedAddressId === address.id
                        ? 'bg-primary/10'
                        : 'bg-surface-alt/70'
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">
                        {address.recipient ?? 'Destinatario'}
                      </p>
                      {address.isPrimary ? (
                        <Badge variant="outline">Principal</Badge>
                      ) : null}
                    </div>
                    <p className="text-foreground-subtle">
                      {address.street}, {address.number}
                    </p>
                    <p className="text-foreground-subtle">
                      {address.city} - {address.state} | CEP {address.zipCode}
                    </p>
                    <div className="mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        disabled={setPrimaryMutation.isPending}
                        onClick={(event) => {
                          event.stopPropagation()
                          setPrimaryMutation.mutate(address.id)
                        }}
                      >
                        Marcar como principal
                      </Button>
                    </div>
                  </button>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  onClick={() => setShowAddressForm((value) => !value)}
                >
                  <MapPin className="size-4" />
                  {showAddressForm ? 'Fechar' : 'Adicionar endereco'}
                </Button>

                {showAddressForm ? (
                  <div className="grid gap-2 rounded-xl bg-surface-alt/60 p-3">
                    <Input
                      placeholder="Nome do destinatario"
                      value={newAddress.recipient ?? ''}
                      onChange={(event) =>
                        setNewAddress((current) => ({
                          ...current,
                          recipient: event.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="CEP"
                      value={newAddress.zipCode}
                      onChange={(event) =>
                        setNewAddress((current) => ({
                          ...current,
                          zipCode: event.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Rua"
                      value={newAddress.street}
                      onChange={(event) =>
                        setNewAddress((current) => ({
                          ...current,
                          street: event.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Input
                        placeholder="Numero"
                        value={newAddress.number}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            number: event.target.value,
                          }))
                        }
                      />
                      <Input
                        className="sm:col-span-2"
                        placeholder="Bairro"
                        value={newAddress.district}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            district: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Input
                        className="sm:col-span-2"
                        placeholder="Cidade"
                        value={newAddress.city}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            city: event.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="UF"
                        value={newAddress.state}
                        maxLength={2}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            state: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Input
                      placeholder="Complemento"
                      value={newAddress.complement ?? ''}
                      onChange={(event) =>
                        setNewAddress((current) => ({
                          ...current,
                          complement: event.target.value,
                        }))
                      }
                    />
                    <label className="flex items-center gap-2 text-sm text-foreground-subtle">
                      <input
                        type="checkbox"
                        checked={Boolean(newAddress.isPrimary)}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            isPrimary: event.target.checked,
                          }))
                        }
                      />
                      Definir como endereco principal
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      className="w-fit"
                      disabled={createAddressMutation.isPending}
                      onClick={addAddress}
                    >
                      Salvar endereco
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Forma de pagamento</CardTitle>
                <CardDescription>Selecione como deseja pagar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-5 pb-5">
                {paymentOptions.map((method) => (
                  <div key={method.id} className="space-y-2">
                    <Button
                      type="button"
                      variant={
                        paymentMethod === method.id ? 'default' : 'outline'
                      }
                      className="h-10 w-full justify-start"
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <CreditCard className="size-4" />
                      {method.label}
                    </Button>

                    {paymentMethod === 'pix' && method.id === 'pix' ? (
                      <div className="rounded-xl bg-surface-alt/60 p-3 text-sm">
                        <div className="mb-2 grid h-28 w-28 place-items-center rounded-lg bg-surface text-xs text-foreground-subtle">
                          QR Code
                        </div>
                        <p className="text-foreground-subtle">
                          Pagamento aprovado em poucos minutos.
                        </p>
                      </div>
                    ) : null}

                    {paymentMethod === 'boleto' && method.id === 'boleto' ? (
                      <div className="rounded-xl bg-surface-alt/60 p-3 text-sm text-foreground-subtle">
                        Boleto com vencimento em 2 dias.
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Revisao dos produtos</CardTitle>
                <CardDescription>Itens ativos do carrinho</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                {cartQuery.isLoading ? (
                  <div className="rounded-xl bg-surface-alt/70 px-3 py-2 text-sm text-foreground-subtle">
                    Carregando itens...
                  </div>
                ) : null}

                {checkoutItems.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-surface-alt/70 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-foreground-subtle">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      {currency.format(item.subtotalInCents / 100)}
                    </p>
                  </article>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit rounded-2xl py-0 lg:sticky lg:top-24">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-2 rounded-xl bg-surface-alt/70 p-3 text-sm">
                <SummaryRow label="Subtotal" value={summary.subtotalInCents} />
                <SummaryRow label="Frete" value={summary.shippingInCents} />
                <SummaryRow label="Desconto" value={-summary.discountInCents} />
                <div className="mt-2 border-border/50 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Total final
                    </span>
                    <span className="font-heading text-xl font-bold text-foreground">
                      {currency.format(summary.totalInCents / 100)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-surface-alt/70 p-3">
                <p className="text-sm font-medium text-foreground">
                  Cupom de desconto
                </p>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="Digite seu cupom"
                  />
                  <Button type="button" variant="outline" onClick={applyCoupon}>
                    Aplicar
                  </Button>
                </div>
                {appliedCoupon ? (
                  <Badge variant="secondary">
                    Cupom aplicado: {appliedCoupon}
                  </Badge>
                ) : null}
                {couponFeedback ? (
                  <p className="text-sm text-foreground-subtle">
                    {couponFeedback}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
                Prazo estimado: 3 a 5 dias uteis.
              </div>

              <div className="rounded-xl bg-surface-alt/70 px-3 py-2 text-sm">
                <span className="text-foreground-subtle">
                  Pagamento selecionado:{' '}
                </span>
                <Badge variant="outline" className="ml-2">
                  {paymentOptions.find((method) => method.id === paymentMethod)
                    ?.label ?? 'Pagamento'}
                </Badge>
              </div>

              {feedback ? (
                <div className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">
                  {feedback}
                </div>
              ) : null}

              <Button
                type="button"
                className="h-11 w-full"
                disabled={
                  checkoutItems.length === 0 ||
                  !selectedAddress ||
                  createOrderMutation.isPending
                }
                onClick={handleFinalizeOrder}
              >
                <ReceiptText className="size-4" />
                {createOrderMutation.isPending
                  ? 'Finalizando...'
                  : 'Finalizar pedido'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full"
                render={<Link to="/marketplace" />}
              >
                <Truck className="size-4" />
                Continuar comprando
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground-subtle">{label}</span>
      <span className="font-medium text-foreground">
        {currency.format(value / 100)}
      </span>
    </div>
  )
}
