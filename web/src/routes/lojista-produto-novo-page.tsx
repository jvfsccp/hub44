import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ImagePlus, PackagePlus } from 'lucide-react'
import { type FormEvent, useState } from 'react'

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
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { catalogQueryKeys, listCategories } from '@/lib/catalog'
import {
  createSellerProduct,
  parsePriceToCents,
  sellerProductQueryKeys,
  uploadSellerProductImage,
} from '@/lib/seller-products'

export function LojistaProdutoNovoPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [productStatus, setProductStatus] = useState<'draft' | 'active'>(
    'draft',
  )
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const categoriesQuery = useQuery({
    queryKey: catalogQueryKeys.categories,
    queryFn: listCategories,
  })
  const createMutation = useMutation({
    mutationFn: createSellerProduct,
    onSuccess: async ({ product }) => {
      if (image) {
        await uploadSellerProductImage({ productId: product.id, image })
      }

      queryClient.invalidateQueries({ queryKey: sellerProductQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.products() })
      setFeedback('Produto cadastrado com sucesso.')
      navigate({ to: '/lojista/produtos' })
    },
    onError: (error) => {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel cadastrar o produto.',
      )
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const priceInCents = parsePriceToCents(price)
    const stockValue = Number(stock)

    if (!categoryId) {
      setFeedback('Selecione uma categoria.')
      return
    }

    if (!priceInCents) {
      setFeedback('Informe um preco valido.')
      return
    }

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      setFeedback('Informe um estoque valido.')
      return
    }

    setFeedback(null)
    createMutation.mutate({
      categoryId,
      name,
      slug: slug.trim() || undefined,
      description: description.trim() || null,
      priceInCents,
      stock: stockValue,
      status: productStatus,
    })
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto w-full max-w-5xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <div className="space-y-2">
          <Link
            to="/lojista/produtos"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-subtle transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Voltar para produtos
          </Link>
          <Badge className="bg-secondary/20 text-secondary-foreground">
            <PackagePlus className="size-3.5" />
            Cadastro de produto
          </Badge>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Novo produto
          </h1>
          <p className="text-sm text-foreground-subtle sm:text-base">
            Cadastre um item real no catalogo da sua loja.
          </p>
        </div>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Dados do produto</CardTitle>
            <CardDescription>
              Esses dados serao publicados na API do Hub44.
            </CardDescription>
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
                  <Label htmlFor="produto-slug">Slug personalizado</Label>
                  <Input
                    id="produto-slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="Opcional"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Status do produto</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-alt p-1">
                    <Button
                      type="button"
                      variant={
                        productStatus === 'draft' ? 'default' : 'outline'
                      }
                      className="h-10 rounded-lg"
                      onClick={() => setProductStatus('draft')}
                    >
                      Rascunho
                    </Button>
                    <Button
                      type="button"
                      variant={
                        productStatus === 'active' ? 'default' : 'outline'
                      }
                      className="h-10 rounded-lg"
                      onClick={() => setProductStatus('active')}
                    >
                      Ativo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="produto-categoria">Categoria</Label>
                  <select
                    id="produto-categoria"
                    className="h-10 rounded-md bg-surface-alt px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {(categoriesQuery.data?.categories ?? []).map(
                      (category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="produto-estoque">Estoque inicial</Label>
                  <Input
                    id="produto-estoque"
                    inputMode="numeric"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(event) => setStock(event.target.value)}
                    placeholder="Ex: 48"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="produto-preco">Preco</Label>
                  <Input
                    id="produto-preco"
                    inputMode="decimal"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="Ex: R$ 189,90"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="produto-imagem">Imagem do produto</Label>
                  <label
                    htmlFor="produto-imagem"
                    className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-surface-alt px-3 text-sm text-foreground-subtle ring-primary/20 transition hover:bg-surface focus-within:ring-2"
                  >
                    <ImagePlus className="size-4" />
                    {image?.name ?? 'Selecionar imagem'}
                  </label>
                  <input
                    id="produto-imagem"
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setImage(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="produto-descricao">Descricao</Label>
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
                  type="submit"
                  variant="secondary"
                  className="h-11"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Salvando...' : 'Salvar produto'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  render={<Link to="/lojista/produtos" />}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
