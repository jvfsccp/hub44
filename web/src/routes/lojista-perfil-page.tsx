import { Link } from '@tanstack/react-router'
import { Building2, Clock3, MapPin, ShieldCheck, Store, Truck } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LojistaPerfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [storeStatus] = useState<'publicada' | 'revisao'>('publicada')

  const [storeName, setStoreName] = useState('Loja Aurora Fashion')
  const [storeDescription, setStoreDescription] = useState('Moda feminina com curadoria premium para atacado e revenda.')
  const [storeCategory, setStoreCategory] = useState('Moda Feminina')
  const [storeSlogan, setStoreSlogan] = useState('Curadoria com foco em margem e giro')

  const [businessEmail, setBusinessEmail] = useState('contato@aurorafashion.com')
  const [phone, setPhone] = useState('(62) 3232-9988')
  const [whatsapp, setWhatsapp] = useState('(62) 99999-8877')
  const [instagram, setInstagram] = useState('@aurorafashion44')

  const [businessHours, setBusinessHours] = useState('Seg a Sab, 08:00 as 18:00')
  const [deliveryMethods, setDeliveryMethods] = useState('Transportadora expressa, Entrega padrao')
  const [pickupInStore, setPickupInStore] = useState(true)
  const [avgShipping, setAvgShipping] = useState('18h')

  const [pixKey, setPixKey] = useState('financeiro@aurorafashion.com')
  const [bank, setBank] = useState('Banco Hub')
  const [agency, setAgency] = useState('4321')
  const [account, setAccount] = useState('009988-7')
  const [receivingStatus, setReceivingStatus] = useState('Ativo e regular')

  const previewProducts = [
    { name: 'Blazer Alfaiataria', price: 'R$ 189,90', rating: '4,9' },
    { name: 'Conjunto Linho', price: 'R$ 249,90', rating: '4,8' },
    { name: 'Camisa Premium', price: 'R$ 129,90', rating: '4,7' },
  ]

  function handleEdit() {
    setIsEditing(true)
    setFeedback(null)
  }

  function handleSave() {
    setIsEditing(false)
    setFeedback('Alteracoes salvas localmente com sucesso.')
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <header className="space-y-4">
          <div className="h-32 rounded-3xl bg-linear-135 from-primary/25 via-primary/10 to-secondary/20" />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Store className="size-7" />
              </div>

              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{storeName}</h1>
                <p className="text-sm text-foreground-subtle sm:text-base">{storeCategory}</p>
                <p className="mt-1 text-sm text-foreground-subtle">Atualize as configuracoes e mantenha a loja pronta para vender.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={storeStatus === 'publicada' ? 'default' : 'secondary'}>
                {storeStatus === 'publicada' ? 'Publicada' : 'Em revisao'}
              </Badge>
              <Button type="button" variant="outline" onClick={handleEdit} disabled={isEditing}>
                Editar
              </Button>
              <Button type="button" onClick={handleSave} disabled={!isEditing}>
                Salvar alteracoes
              </Button>
            </div>
          </div>
        </header>

        {feedback ? (
          <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">{feedback}</div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Informacoes da loja</CardTitle>
              <CardDescription>Dados principais de apresentacao</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field label="Nome da loja" value={storeName} onChange={setStoreName} disabled={!isEditing} />
              <Field label="Descricao" value={storeDescription} onChange={setStoreDescription} disabled={!isEditing} />
              <Field label="Categoria" value={storeCategory} onChange={setStoreCategory} disabled={!isEditing} />
              <Field label="Slogan curto" value={storeSlogan} onChange={setStoreSlogan} disabled={!isEditing} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Contato</CardTitle>
              <CardDescription>Canais oficiais da sua loja</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field label="Email comercial" value={businessEmail} onChange={setBusinessEmail} disabled={!isEditing} />
              <Field label="Telefone" value={phone} onChange={setPhone} disabled={!isEditing} />
              <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} disabled={!isEditing} />
              <Field label="Instagram" value={instagram} onChange={setInstagram} disabled={!isEditing} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Operacao</CardTitle>
              <CardDescription>Fluxo de atendimento e entrega</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field label="Horario de funcionamento" value={businessHours} onChange={setBusinessHours} disabled={!isEditing} />
              <Field label="Metodos de entrega" value={deliveryMethods} onChange={setDeliveryMethods} disabled={!isEditing} />
              <div className="flex items-center justify-between rounded-xl bg-surface-alt/70 px-3 py-2">
                <span className="text-sm font-medium text-foreground">Retirada em loja</span>
                <Checkbox checked={pickupInStore} onCheckedChange={(value) => setPickupInStore(Boolean(value))} disabled={!isEditing} />
              </div>
              <Field label="Prazo medio de envio" value={avgShipping} onChange={setAvgShipping} disabled={!isEditing} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle>Financeiro</CardTitle>
              <CardDescription>Dados de recebimento da operacao</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5">
              <Field label="Chave PIX" value={pixKey} onChange={setPixKey} disabled={!isEditing} />
              <Field label="Banco" value={bank} onChange={setBank} disabled={!isEditing} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Agencia" value={agency} onChange={setAgency} disabled={!isEditing} />
                <Field label="Conta" value={account} onChange={setAccount} disabled={!isEditing} />
              </div>
              <Field label="Status de recebimento" value={receivingStatus} onChange={setReceivingStatus} disabled={!isEditing} />
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Preview da loja</CardTitle>
            <CardDescription>Visao simulada de como os clientes enxergam sua pagina</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <div className="rounded-2xl bg-surface-alt/70 p-4">
              <div className="h-24 rounded-xl bg-linear-135 from-primary/25 to-secondary/20" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-heading text-xl font-semibold text-foreground">{storeName}</p>
                  <p className="text-sm text-foreground-subtle">{storeSlogan}</p>
                </div>
                <Badge variant="outline">Avaliacao 4,8/5</Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {previewProducts.map((product) => (
                <article key={product.name} className="rounded-xl bg-surface-alt/70 p-3">
                  <div className="mb-2 h-16 rounded-lg bg-linear-135 from-primary/20 to-secondary/20" />
                  <p className="text-sm font-semibold text-foreground">{product.name}</p>
                  <p className="text-xs text-foreground-subtle">{product.price}</p>
                  <p className="text-xs text-foreground-subtle">Avaliacao {product.rating}</p>
                </article>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Building2 className="size-3.5" />
                Operacao estruturada
              </Badge>
              <Badge variant="outline">
                <Truck className="size-3.5" />
                Entrega ativa
              </Badge>
              <Badge variant="outline">
                <Clock3 className="size-3.5" />
                SLA medio {avgShipping}
              </Badge>
              <Badge variant="outline">
                <MapPin className="size-3.5" />
                Retirada {pickupInStore ? 'disponivel' : 'indisponivel'}
              </Badge>
              <Badge variant="outline">
                <ShieldCheck className="size-3.5" />
                Conta verificada
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="text-right">
          <Button variant="ghost" render={<Link to="/lojista/dashboard" />}>
            Voltar ao painel do lojista
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
    </div>
  )
}
