import { Link, useNavigate } from '@tanstack/react-router'
import { CreditCard, MapPin, ReceiptText, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type CheckoutItem = {
  id: string
  name: string
  quantity: number
  subtotal: number
}

type Address = {
  id: string
  recipient: string
  cep: string
  street: string
  number: string
  city: string
  state: string
  isPrimary: boolean
}

type SavedCard = {
  id: string
  holder: string
  lastDigits: string
  brand: string
  expiry: string
}

const checkoutItems: CheckoutItem[] = [
  { id: 'chk-1', name: 'Blazer Alfaiataria Premium', quantity: 2, subtotal: 379.8 },
  { id: 'chk-2', name: 'Camisa Social Slim', quantity: 1, subtotal: 129.9 },
  { id: 'chk-3', name: 'Calca Reta Premium', quantity: 3, subtotal: 479.7 },
]

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function CheckoutPage() {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | 'boleto'>('cartao')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1')
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      recipient: 'Mariana Costa',
      cep: '74000-000',
      street: 'Rua das Confeccoes',
      number: '144',
      city: 'Goiania',
      state: 'GO',
      isPrimary: true,
    },
    {
      id: 'addr-2',
      recipient: 'Mariana Costa',
      cep: '74835-120',
      street: 'Av. Independencia',
      number: '1200',
      city: 'Goiania',
      state: 'GO',
      isPrimary: false,
    },
  ])
  const [newAddress, setNewAddress] = useState({
    recipient: '',
    cep: '',
    street: '',
    number: '',
    city: '',
    state: '',
    isPrimary: false,
  })
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: 'card-1',
      holder: 'Mariana Costa',
      lastDigits: '8421',
      brand: 'Visa',
      expiry: '09/29',
    },
    {
      id: 'card-2',
      holder: 'Mariana Costa',
      lastDigits: '3102',
      brand: 'Mastercard',
      expiry: '01/28',
    },
  ])
  const [selectedCardId, setSelectedCardId] = useState('card-1')
  const [showCardForm, setShowCardForm] = useState(false)
  const [newCard, setNewCard] = useState({
    holder: '',
    number: '',
    expiry: '',
    cvv: '',
  })

  const subtotal = useMemo(
    () => checkoutItems.reduce((acc, item) => acc + item.subtotal, 0),
    [],
  )
  const shipping = 24.9
  const discount = appliedCoupon === 'HUB44' ? subtotal * 0.1 : 0
  const total = subtotal + shipping - discount

  function applyCoupon() {
    const normalized = couponCode.trim().toUpperCase()

    if (normalized === 'HUB44') {
      setAppliedCoupon(normalized)
      setCouponFeedback('Cupom aplicado com sucesso.')
      return
    }

    setAppliedCoupon(null)
    setCouponFeedback('Cupom invalido para esta simulacao.')
  }

  function addAddress() {
    if (!newAddress.recipient || !newAddress.cep || !newAddress.street) return

    const nextId = `addr-${addresses.length + 1}`
    setAddresses((current) => {
      const normalized = newAddress.isPrimary
        ? current.map((address) => ({ ...address, isPrimary: false }))
        : current

      return [
        ...normalized,
        {
          id: nextId,
          recipient: newAddress.recipient,
          cep: newAddress.cep,
          street: newAddress.street,
          number: newAddress.number,
          city: newAddress.city,
          state: newAddress.state,
          isPrimary: newAddress.isPrimary,
        },
      ]
    })
    setSelectedAddressId(nextId)
    setShowAddressForm(false)
    setNewAddress({ recipient: '', cep: '', street: '', number: '', city: '', state: '', isPrimary: false })
  }

  function setPrimaryAddress(addressId: string) {
    setAddresses((current) =>
      current.map((address) => ({ ...address, isPrimary: address.id === addressId })),
    )
  }

  function addCard() {
    if (!newCard.holder || !newCard.number || !newCard.expiry || !newCard.cvv) return

    const nextId = `card-${savedCards.length + 1}`
    const digits = newCard.number.replace(/\D/g, '').slice(-4)
    setSavedCards((current) => [
      ...current,
      {
        id: nextId,
        holder: newCard.holder,
        lastDigits: digits || '0000',
        brand: 'Cartao',
        expiry: newCard.expiry,
      },
    ])
    setSelectedCardId(nextId)
    setShowCardForm(false)
    setNewCard({ holder: '', number: '', expiry: '', cvv: '' })
  }

  function handleFinalizeOrder() {
    setFeedback('Pedido confirmado localmente. Redirecionando...')
    setTimeout(() => {
      navigate({ to: '/pedido/sucesso' })
    }, 700)
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Finalizar pedido</h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Revise as informacoes da entrega e selecione a forma de pagamento.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Endereco de entrega</CardTitle>
                <CardDescription>Dados simulados locais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5 text-sm">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    className={`w-full rounded-xl p-3 text-left transition-colors ${
                      selectedAddressId === address.id ? 'bg-primary/10' : 'bg-surface-alt/70'
                    }`}
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{address.recipient}</p>
                      {address.isPrimary ? <Badge variant="outline">Principal</Badge> : null}
                    </div>
                    <p className="text-foreground-subtle">{address.street}, {address.number}</p>
                    <p className="text-foreground-subtle">{address.city} - {address.state} | CEP {address.cep}</p>
                    <div className="mt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={(event) => {
                          event.stopPropagation()
                          setPrimaryAddress(address.id)
                        }}
                      >
                        Marcar como principal
                      </Button>
                    </div>
                  </button>
                ))}

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="h-9" onClick={() => setShowAddressForm((value) => !value)}>
                    <MapPin className="size-4" />
                    {showAddressForm ? 'Fechar' : 'Adicionar endereco'}
                  </Button>
                  <Button type="button" variant="ghost" className="h-9">
                    Alterar endereco
                  </Button>
                </div>

                {showAddressForm ? (
                  <div className="grid gap-2 rounded-xl bg-surface-alt/60 p-3">
                    <Input placeholder="Nome do destinatario" value={newAddress.recipient} onChange={(event) => setNewAddress((current) => ({ ...current, recipient: event.target.value }))} />
                    <Input placeholder="CEP" value={newAddress.cep} onChange={(event) => setNewAddress((current) => ({ ...current, cep: event.target.value }))} />
                    <Input placeholder="Rua" value={newAddress.street} onChange={(event) => setNewAddress((current) => ({ ...current, street: event.target.value }))} />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Input placeholder="Numero" value={newAddress.number} onChange={(event) => setNewAddress((current) => ({ ...current, number: event.target.value }))} />
                      <Input className="sm:col-span-2" placeholder="Cidade" value={newAddress.city} onChange={(event) => setNewAddress((current) => ({ ...current, city: event.target.value }))} />
                    </div>
                    <Input placeholder="Estado" value={newAddress.state} onChange={(event) => setNewAddress((current) => ({ ...current, state: event.target.value }))} />
                    <label className="flex items-center gap-2 text-sm text-foreground-subtle">
                      <input
                        type="checkbox"
                        checked={newAddress.isPrimary}
                        onChange={(event) => setNewAddress((current) => ({ ...current, isPrimary: event.target.checked }))}
                      />
                      Definir como endereco principal
                    </label>
                    <Button type="button" size="sm" className="w-fit" onClick={addAddress}>
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
                {([
                  { id: 'cartao', label: 'Cartao de credito' },
                  { id: 'pix', label: 'PIX' },
                  { id: 'boleto', label: 'Boleto' },
                ] as const).map((method) => (
                  <div key={method.id} className="space-y-2">
                    <Button
                      type="button"
                      variant={paymentMethod === method.id ? 'default' : 'outline'}
                      className="h-10 w-full justify-start"
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <CreditCard className="size-4" />
                      {method.label}
                    </Button>

                    {paymentMethod === 'cartao' && method.id === 'cartao' ? (
                      <div className="space-y-2 rounded-xl bg-surface-alt/60 p-3">
                        {savedCards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                              selectedCardId === card.id ? 'bg-primary/10' : 'bg-surface'
                            }`}
                            onClick={() => setSelectedCardId(card.id)}
                          >
                            <span>{card.brand} •••• {card.lastDigits}</span>
                            <span className="text-foreground-subtle">{card.expiry}</span>
                          </button>
                        ))}

                        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setShowCardForm((value) => !value)}>
                          {showCardForm ? 'Fechar' : 'Adicionar cartao'}
                        </Button>

                        {showCardForm ? (
                          <div className="grid gap-2 rounded-lg bg-surface p-3">
                            <Input placeholder="Nome no cartao" value={newCard.holder} onChange={(event) => setNewCard((current) => ({ ...current, holder: event.target.value }))} />
                            <Input placeholder="Numero do cartao" value={newCard.number} onChange={(event) => setNewCard((current) => ({ ...current, number: event.target.value }))} />
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input placeholder="Validade" value={newCard.expiry} onChange={(event) => setNewCard((current) => ({ ...current, expiry: event.target.value }))} />
                              <Input placeholder="CVV" value={newCard.cvv} onChange={(event) => setNewCard((current) => ({ ...current, cvv: event.target.value }))} />
                            </div>
                            <Button type="button" size="sm" className="w-fit" onClick={addCard}>
                              Salvar cartao
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {paymentMethod === 'pix' && method.id === 'pix' ? (
                      <div className="rounded-xl bg-surface-alt/60 p-3 text-sm">
                        <div className="mb-2 grid h-28 w-28 place-items-center rounded-lg bg-surface text-xs text-foreground-subtle">QR Code</div>
                        <p className="text-foreground-subtle">Pagamento aprovado em poucos minutos.</p>
                      </div>
                    ) : null}

                    {paymentMethod === 'boleto' && method.id === 'boleto' ? (
                      <div className="rounded-xl bg-surface-alt/60 p-3 text-sm text-foreground-subtle">
                        Boleto com vencimento em 2 dias. Compensacao em ate 1 dia util apos pagamento.
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl py-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>Revisao dos produtos</CardTitle>
                <CardDescription>Itens confirmados para o pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5 pb-5">
                {checkoutItems.map((item) => (
                  <article key={item.id} className="flex items-center justify-between rounded-xl bg-surface-alt/70 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-foreground-subtle">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-foreground">{currency.format(item.subtotal)}</p>
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
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">Subtotal</span>
                  <span className="font-medium text-foreground">{currency.format(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">Frete</span>
                  <span className="font-medium text-foreground">{currency.format(shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-subtle">Desconto</span>
                  <span className="font-medium text-foreground">-{currency.format(discount)}</span>
                </div>
                <div className="mt-2 border-t border-border/50 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total final</span>
                    <span className="font-heading text-xl font-bold text-foreground">{currency.format(total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-surface-alt/70 p-3">
                <p className="text-sm font-medium text-foreground">Cupom de desconto</p>
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
                {appliedCoupon ? <Badge variant="secondary">Cupom aplicado: {appliedCoupon}</Badge> : null}
                {couponFeedback ? (
                  <p className={`text-sm ${appliedCoupon ? 'text-primary' : 'text-foreground-subtle'}`}>
                    {couponFeedback}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
                Prazo estimado: 3 a 5 dias uteis.
              </div>

              <div className="rounded-xl bg-surface-alt/70 px-3 py-2 text-sm">
                <span className="text-foreground-subtle">Pagamento selecionado: </span>
                <Badge variant="outline" className="ml-2">
                  {paymentMethod === 'cartao' ? 'Cartao' : paymentMethod === 'pix' ? 'PIX' : 'Boleto'}
                </Badge>
              </div>

              {feedback ? (
                <div className="rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">{feedback}</div>
              ) : null}

              <Button type="button" className="h-11 w-full" onClick={handleFinalizeOrder}>
                <ReceiptText className="size-4" />
                Finalizar pedido
              </Button>
              <Button type="button" variant="secondary" className="h-11 w-full" render={<Link to="/marketplace" />}>
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
