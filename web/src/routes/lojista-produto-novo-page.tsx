import { Link } from '@tanstack/react-router'
import { ArrowLeft, PackagePlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LojistaProdutoNovoPage() {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('')
  const [sizes, setSizes] = useState('')
  const [colors, setColors] = useState('')
  const [productStatus, setProductStatus] = useState<'rascunho' | 'ativo'>('rascunho')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function simulateSave(mode: 'rascunho' | 'publicado') {
    setFeedback(null)
    setLoading(true)

    await new Promise((resolve) => {
      setTimeout(resolve, 900)
    })

    setLoading(false)
    setFeedback(
      mode === 'rascunho'
        ? 'Rascunho salvo localmente para validação de interface.'
        : 'Produto publicado localmente para validação de interface.',
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await simulateSave('publicado')
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

      <section className="mx-auto w-full max-w-5xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <div className="space-y-2">
          <Link
            to="/lojista/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-subtle transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Voltar ao dashboard
          </Link>
          <Badge className="bg-secondary/20 text-secondary-foreground">
            <PackagePlus className="size-3.5" />
            Cadastro de produto
          </Badge>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Novo produto</h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Preencha os dados para cadastrar um novo item da sua loja.
          </p>
        </div>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Dados do produto</CardTitle>
            <CardDescription>Formulario com dados simulados locais</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="produto-nome">Nome do produto</Label>
                <Input
                  id="produto-nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: Blazer alfaiataria premium"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="produto-sku">SKU / código</Label>
                  <Input
                    id="produto-sku"
                    value={sku}
                    onChange={(event) => setSku(event.target.value)}
                    placeholder="Ex: BLZ-4491"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Status do produto</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-alt p-1">
                    <Button
                      type="button"
                      variant={productStatus === 'rascunho' ? 'default' : 'outline'}
                      className="h-10 rounded-lg"
                      onClick={() => setProductStatus('rascunho')}
                    >
                      Rascunho
                    </Button>
                    <Button
                      type="button"
                      variant={productStatus === 'ativo' ? 'default' : 'outline'}
                      className="h-10 rounded-lg"
                      onClick={() => setProductStatus('ativo')}
                    >
                      Ativo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="produto-categoria">Categoria</Label>
                  <Input
                    id="produto-categoria"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Ex: Feminino"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="produto-estoque">Estoque inicial</Label>
                  <Input
                    id="produto-estoque"
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="Ex: 48"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="produto-estoque-minimo">Estoque mínimo</Label>
                  <Input
                    id="produto-estoque-minimo"
                    value={minStock}
                    onChange={(event) => setMinStock(event.target.value)}
                    placeholder="Ex: 10"
                    required
                  />
                </div>

                <div className="rounded-xl bg-surface-alt/70 p-4">
                  <p className="text-sm text-foreground-subtle">Imagem do produto</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Placeholder visual (sem upload real)</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="produto-preco">Preco</Label>
                <Input
                  id="produto-preco"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Ex: R$ 189,90"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="produto-tamanhos">Variações de tamanho</Label>
                  <Input
                    id="produto-tamanhos"
                    value={sizes}
                    onChange={(event) => setSizes(event.target.value)}
                    placeholder="Ex: P, M, G, GG"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="produto-cores">Variações de cor</Label>
                  <Input
                    id="produto-cores"
                    value={colors}
                    onChange={(event) => setColors(event.target.value)}
                    placeholder="Ex: Preto, Bege, Azul"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="produto-descricao">Descrição</Label>
                <textarea
                  id="produto-descricao"
                  className="min-h-28 rounded-md border border-transparent bg-surface-alt px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary/40 focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Descreva diferencial, modelagem e composicao do produto"
                />
              </div>

              {feedback ? (
                <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
                  {feedback}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  disabled={loading}
                  onClick={() => simulateSave('rascunho')}
                >
                  Salvar rascunho
                </Button>
                <Button type="submit" variant="secondary" className="h-11" disabled={loading}>
                  {loading ? 'Publicando...' : 'Publicar produto'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
