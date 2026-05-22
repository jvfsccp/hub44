import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Box, ImagePlus, Search, Store } from 'lucide-react'
import { useMemo, useState } from 'react'

import productBlazerImage from '@/assets/stitch/product-blazer.png'
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
import { ApiError } from '@/lib/api'
import { catalogQueryKeys, listCategories } from '@/lib/catalog'
import { getProductImageUrls } from '@/lib/product-images'
import {
  listSellerProducts,
  parsePriceToCents,
  type SellerProduct,
  type SellerProductStatus,
  sellerProductQueryKeys,
  updateSellerProduct,
  updateSellerProductStatus,
  uploadSellerProductImage,
} from '@/lib/seller-products'

type ProductFilter =
  | 'Todos'
  | 'Ativos'
  | 'Pausados'
  | 'Rascunhos'
  | 'Sem estoque'

type ProductDraft = {
  name: string
  categoryId: string
  description: string
  price: string
  stock: string
  status: SellerProductStatus
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})
const dateFormatter = new Intl.DateTimeFormat('pt-BR')

const filters: ProductFilter[] = [
  'Todos',
  'Ativos',
  'Pausados',
  'Rascunhos',
  'Sem estoque',
]

const statusLabels: Record<SellerProductStatus, string> = {
  active: 'Ativo',
  paused: 'Pausado',
  draft: 'Rascunho',
  inactive: 'Inativo',
  out_of_stock: 'Sem estoque',
}

function lifecycleBadge(status: SellerProductStatus) {
  if (status === 'active') return <Badge>Ativo</Badge>
  if (status === 'paused') return <Badge variant="secondary">Pausado</Badge>
  if (status === 'draft') return <Badge variant="outline">Rascunho</Badge>
  if (status === 'out_of_stock')
    return <Badge variant="secondary">Sem estoque</Badge>
  return <Badge variant="outline">Inativo</Badge>
}

function getDateLabel(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return dateFormatter.format(date)
}

function toDraft(product: SellerProduct): ProductDraft {
  return {
    name: product.name,
    categoryId: product.categoryId,
    description: product.description ?? '',
    price: currency.format(product.priceInCents / 100),
    stock: String(product.stock),
    status: product.status,
  }
}

export function LojistaProdutosPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ProductFilter>('Todos')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<ProductDraft | null>(null)
  const [editImage, setEditImage] = useState<File | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const productsQuery = useQuery({
    queryKey: sellerProductQueryKeys.all,
    queryFn: listSellerProducts,
  })
  const categoriesQuery = useQuery({
    queryKey: catalogQueryKeys.categories,
    queryFn: listCategories,
  })
  const updateMutation = useMutation({
    mutationFn: updateSellerProduct,
    onSuccess: async ({ product }) => {
      if (editImage) {
        await uploadSellerProductImage({
          productId: product.id,
          image: editImage,
        })
      }

      setFeedback('Produto atualizado.')
      setEditingProductId(null)
      setEditDraft(null)
      setEditImage(null)
      invalidateProducts(queryClient)
    },
    onError: handleMutationError,
  })
  const statusMutation = useMutation({
    mutationFn: updateSellerProductStatus,
    onSuccess: () => {
      invalidateProducts(queryClient)
    },
    onError: handleMutationError,
  })

  const products = productsQuery.data?.products ?? []
  const categories = categoriesQuery.data?.categories ?? []
  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  )
  const activeCount = products.filter(
    (product) => product.status === 'active' && product.stock > 0,
  ).length
  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= 8,
  ).length
  const outOfStockCount = products.filter(
    (product) => product.stock === 0 || product.status === 'out_of_stock',
  ).length

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const categoryName = categoryNameById.get(product.categoryId) ?? ''
      const matchesSearch =
        !query ||
        `${product.name} ${categoryName} ${product.slug}`
          .toLowerCase()
          .includes(query)
      const matchesFilter =
        filter === 'Todos' ||
        (filter === 'Ativos' &&
          product.status === 'active' &&
          product.stock > 0) ||
        (filter === 'Pausados' && product.status === 'paused') ||
        (filter === 'Rascunhos' && product.status === 'draft') ||
        (filter === 'Sem estoque' &&
          (product.stock === 0 || product.status === 'out_of_stock'))

      return matchesSearch && matchesFilter
    })
  }, [categoryNameById, filter, products, search])

  function handleMutationError(error: unknown) {
    setFeedback(
      error instanceof ApiError
        ? error.message
        : 'Nao foi possivel concluir a operacao.',
    )
  }

  function openEditor(product: SellerProduct) {
    setFeedback(null)
    setEditingProductId(product.id)
    setEditDraft(toDraft(product))
    setEditImage(null)
  }

  function cancelEditor() {
    setEditingProductId(null)
    setEditDraft(null)
    setEditImage(null)
  }

  function saveChanges(productId: string) {
    if (!editDraft) return

    const priceInCents = parsePriceToCents(editDraft.price)
    const stock = Number(editDraft.stock)

    if (!priceInCents) {
      setFeedback('Informe um preco valido.')
      return
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFeedback('Informe um estoque valido.')
      return
    }

    updateMutation.mutate({
      productId,
      data: {
        name: editDraft.name,
        categoryId: editDraft.categoryId,
        description: editDraft.description.trim() || null,
        priceInCents,
        stock,
        status: editDraft.status,
      },
    })
  }

  function setProductStatus(productId: string, status: SellerProductStatus) {
    setFeedback(null)
    statusMutation.mutate({ productId, status })
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto w-full max-w-7xl space-y-6 rounded-3xl bg-surface/85 p-6 shadow-[0_18px_40px_-14px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/lojista/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground-subtle transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Voltar ao dashboard
            </Link>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Meus produtos
            </h1>
            <p className="text-sm text-foreground-subtle sm:text-base">
              Gerencie catalogo, imagens, estoque e status da sua loja.
            </p>
          </div>
          <Button
            variant="secondary"
            render={<Link to="/lojista/produtos/novo" />}
          >
            Novo produto
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Produtos ativos" value={String(activeCount)} />
          <SummaryCard title="Baixo estoque" value={String(lowStockCount)} />
          <SummaryCard title="Sem estoque" value={String(outOfStockCount)} />
          <SummaryCard
            title="Total de produtos"
            value={String(products.length)}
          />
        </div>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Busca e filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-subtle" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, categoria ou slug"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={filter === option ? 'default' : 'outline'}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </Button>
              ))}
            </div>

            <p className="text-sm text-foreground-subtle">
              {filteredProducts.length} produto(s) encontrado(s)
            </p>
          </CardContent>
        </Card>

        {feedback ? (
          <div className="rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
            {feedback}
          </div>
        ) : null}

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Catalogo da loja</CardTitle>
            <CardDescription>Dados sincronizados com a API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            {productsQuery.isLoading ? (
              <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center text-sm text-foreground-subtle">
                Carregando produtos...
              </div>
            ) : null}

            {!productsQuery.isLoading && filteredProducts.length === 0 ? (
              <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center">
                <Box className="mx-auto mb-2 size-6 text-foreground-subtle" />
                <p className="font-medium text-foreground">
                  Nenhum produto encontrado
                </p>
                <p className="mt-1 text-sm text-foreground-subtle">
                  Ajuste os filtros ou cadastre um novo produto.
                </p>
              </div>
            ) : null}

            {filteredProducts.map((product) => {
              const categoryName =
                categoryNameById.get(product.categoryId) ?? 'Categoria'
              const isEditing = editingProductId === product.id && editDraft
              const productImage = getProductImageUrls(
                product,
                productBlazerImage,
              )[0]

              return (
                <article
                  key={product.id}
                  className="rounded-xl bg-surface-alt/70 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="h-24 w-full rounded-xl object-cover sm:w-24"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {product.name}
                          </p>
                          <p className="text-sm text-foreground-subtle">
                            {categoryName}
                          </p>
                          <p className="mt-1 text-sm text-foreground-subtle">
                            {product.description ?? 'Sem descricao.'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex flex-wrap justify-end gap-1">
                            {lifecycleBadge(product.status)}
                            {product.stock > 0 && product.stock <= 8 ? (
                              <Badge variant="outline">Baixo estoque</Badge>
                            ) : null}
                          </div>
                          <Badge variant="outline">
                            Atualizado em {getDateLabel(product.updatedAt)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-subtle">
                        <span>Slug: {product.slug}</span>
                        <span>
                          Criado em: {getDateLabel(product.createdAt)}
                        </span>
                        <span>
                          Preco: {currency.format(product.priceInCents / 100)}
                        </span>
                        <span>Estoque: {product.stock}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openEditor(product)}
                        >
                          Editar
                        </Button>
                        {product.status === 'active' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              setProductStatus(product.id, 'paused')
                            }
                          >
                            Pausar produto
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              setProductStatus(product.id, 'active')
                            }
                          >
                            {product.status === 'draft'
                              ? 'Publicar produto'
                              : 'Ativar produto'}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          render={<Link to="/lojista/loja" />}
                        >
                          <Store className="size-4" />
                          Ver loja
                        </Button>
                      </div>

                      {isEditing ? (
                        <div className="mt-2 grid gap-3 rounded-xl bg-surface p-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              value={editDraft.name}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  name: event.target.value,
                                })
                              }
                              placeholder="Nome"
                            />
                            <select
                              className="h-10 rounded-md bg-surface-alt px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                              value={editDraft.categoryId}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  categoryId: event.target.value,
                                })
                              }
                            >
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            value={editDraft.description}
                            onChange={(event) =>
                              setEditDraft({
                                ...editDraft,
                                description: event.target.value,
                              })
                            }
                            placeholder="Descricao"
                          />
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Input
                              value={editDraft.price}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  price: event.target.value,
                                })
                              }
                              placeholder="Preco"
                            />
                            <Input
                              inputMode="numeric"
                              type="number"
                              min={0}
                              value={editDraft.stock}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  stock: event.target.value,
                                })
                              }
                              placeholder="Estoque"
                            />
                            <select
                              className="h-10 rounded-md bg-surface-alt px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                              value={editDraft.status}
                              onChange={(event) =>
                                setEditDraft({
                                  ...editDraft,
                                  status: event.target
                                    .value as SellerProductStatus,
                                })
                              }
                            >
                              {Object.entries(statusLabels).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-surface-alt px-3 text-sm text-foreground-subtle">
                            <ImagePlus className="size-4" />
                            {editImage?.name ?? 'Trocar imagem'}
                            <input
                              className="sr-only"
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                setEditImage(event.target.files?.[0] ?? null)
                              }
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={updateMutation.isPending}
                              onClick={() => saveChanges(product.id)}
                            >
                              Salvar alteracoes
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditor}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-2xl py-0">
      <CardContent className="p-5">
        <p className="text-sm text-foreground-subtle">{title}</p>
        <p className="mt-1 font-heading text-2xl font-semibold text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function invalidateProducts(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: sellerProductQueryKeys.all })
  queryClient.invalidateQueries({ queryKey: catalogQueryKeys.products() })
}
