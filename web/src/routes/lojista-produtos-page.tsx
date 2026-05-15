import { Link } from '@tanstack/react-router'
import { ArrowLeft, Box, Search, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type ProductStatus = 'ativo' | 'pausado' | 'rascunho'

type Product = {
  id: string
  name: string
  description: string
  category: string
  sku: string
  price: number
  stock: number
  status: ProductStatus
  size: string
  color: string
  material: string
  model: string
  createdAt: string
  updatedAt: string
}

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Blazer Alfaiataria Premium',
    description: 'Blazer com corte estruturado para vitrines premium.',
    category: 'Moda Feminina',
    sku: 'BLZ-4491',
    price: 189.9,
    stock: 32,
    status: 'ativo',
    size: 'P, M, G',
    color: 'Areia',
    material: 'Linho misto',
    model: 'Alfaiataria',
    createdAt: '10/04/2026',
    updatedAt: 'Hoje, 10:42',
  },
  {
    id: 'prod-2',
    name: 'Conjunto Linho Soft',
    description: 'Conjunto leve com modelagem moderna para atacado.',
    category: 'Casual Chic',
    sku: 'CJS-1182',
    price: 249.9,
    stock: 6,
    status: 'ativo',
    size: 'M, G',
    color: 'Azul claro',
    material: 'Linho',
    model: 'Conjunto',
    createdAt: '04/04/2026',
    updatedAt: 'Ontem, 17:15',
  },
  {
    id: 'prod-3',
    name: 'Camisa Social Slim',
    description: 'Camisa social slim para publico executivo.',
    category: 'Social',
    sku: 'CMS-7733',
    price: 129.9,
    stock: 0,
    status: 'ativo',
    size: 'M, G, GG',
    color: 'Branca',
    material: 'Algodao',
    model: 'Slim',
    createdAt: '01/04/2026',
    updatedAt: 'Ontem, 12:08',
  },
  {
    id: 'prod-4',
    name: 'Saia Midi Elegance',
    description: 'Saia midi com acabamento premium e alto giro.',
    category: 'Moda Feminina',
    sku: 'SAI-3008',
    price: 149.9,
    stock: 18,
    status: 'rascunho',
    size: 'P, M, G',
    color: 'Preta',
    material: 'Viscose',
    model: 'Midi',
    createdAt: '29/03/2026',
    updatedAt: '22/04, 09:20',
  },
]

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function visualStatus(product: Product) {
  if (product.stock === 0) return 'sem-estoque'
  if (product.stock <= 8) return 'baixo-estoque'
  return product.status
}

function statusBadge(status: ReturnType<typeof visualStatus>) {
  if (status === 'baixo-estoque') return <Badge variant="outline">Baixo estoque</Badge>
  return <Badge variant="secondary">Sem estoque</Badge>
}

function lifecycleBadge(status: ProductStatus) {
  if (status === 'ativo') return <Badge>Ativo</Badge>
  if (status === 'pausado') return <Badge variant="secondary">Pausado</Badge>
  return <Badge variant="outline">Rascunho</Badge>
}

export function LojistaProdutosPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'Todos' | 'Ativos' | 'Pausados' | 'Sem estoque'>('Todos')
  const [products, setProducts] = useState(initialProducts)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Product | null>(null)
  const [updatedProductId, setUpdatedProductId] = useState<string | null>(null)

  const activeCount = products.filter((product) => product.status === 'ativo' && product.stock > 0).length
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 8).length
  const outOfStockCount = products.filter((product) => product.stock === 0).length

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)

      const matchesFilter =
        filter === 'Todos' ||
        (filter === 'Ativos' && product.status === 'ativo' && product.stock > 0) ||
        (filter === 'Pausados' && product.status === 'pausado') ||
        (filter === 'Sem estoque' && product.stock === 0)

      return matchesSearch && matchesFilter
    })
  }, [filter, products, search])

  function pauseProduct(productId: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, status: 'pausado' } : product,
      ),
    )
  }

  function activateProduct(productId: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, status: 'ativo' } : product,
      ),
    )
  }

  function openEditor(product: Product) {
    setEditingProductId(product.id)
    setEditDraft(product)
  }

  function cancelEditor() {
    setEditingProductId(null)
    setEditDraft(null)
  }

  function saveChanges() {
    if (!editingProductId || !editDraft) return

    setProducts((current) =>
      current.map((product) =>
        product.id === editingProductId
          ? {
              ...editDraft,
              updatedAt: 'Agora',
            }
          : product,
      ),
    )

    setUpdatedProductId(editingProductId)
    setEditingProductId(null)
    setEditDraft(null)

    setTimeout(() => {
      setUpdatedProductId(null)
    }, 2000)
  }

  return (
    <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/14 blur-3xl" />

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
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Meus produtos</h1>
            <p className="text-sm text-foreground-subtle sm:text-base">
              Gerencie seu catalogo, estoque e status de exibicao da loja.
            </p>
          </div>
          <Button variant="secondary" render={<Link to="/lojista/produtos/novo" />}>
            Novo produto
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Produtos ativos" value={String(activeCount)} />
          <SummaryCard title="Baixo estoque" value={String(lowStockCount)} />
          <SummaryCard title="Sem estoque" value={String(outOfStockCount)} />
          <SummaryCard title="Total de produtos" value={String(products.length)} />
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
                placeholder="Buscar por nome, categoria ou SKU"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(['Todos', 'Ativos', 'Pausados', 'Sem estoque'] as const).map((option) => (
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

            <p className="text-sm text-foreground-subtle">{filteredProducts.length} produtos encontrados</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>Catalogo da loja</CardTitle>
            <CardDescription>Dados simulados locais para gestao de produtos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            {filteredProducts.length === 0 ? (
              <div className="rounded-xl bg-surface-alt/75 px-4 py-6 text-center">
                <Box className="mx-auto mb-2 size-6 text-foreground-subtle" />
                <p className="font-medium text-foreground">Nenhum produto encontrado</p>
                <p className="mt-1 text-sm text-foreground-subtle">Ajuste os filtros ou o termo de busca.</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const status = visualStatus(product)
                return (
                  <article key={product.id} className="rounded-xl bg-surface-alt/70 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="h-22 w-full rounded-xl bg-linear-135 from-primary/25 to-secondary/25 sm:h-20 sm:w-20" />

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <p className="text-sm text-foreground-subtle">{product.category}</p>
                            <p className="mt-1 text-sm text-foreground-subtle">{product.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex flex-wrap justify-end gap-1">
                              {lifecycleBadge(product.status)}
                              {statusBadge(status)}
                            </div>
                            <Badge variant="outline">Ultima atualizacao: {product.updatedAt}</Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-subtle">
                          <span>SKU: {product.sku}</span>
                          <span>Criado em: {product.createdAt}</span>
                          <span>Preco: {currency.format(product.price)}</span>
                          <span>Estoque: {product.stock}</span>
                          {product.stock > 0 && product.stock <= 8 ? (
                            <span className="font-medium text-secondary-foreground">Aviso: estoque baixo</span>
                          ) : null}
                        </div>

                        {updatedProductId === product.id ? (
                          <Badge variant="secondary">Produto atualizado</Badge>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEditor(product)}>
                            Editar
                          </Button>
                          {product.status === 'ativo' ? (
                            <Button type="button" size="sm" variant="ghost" onClick={() => pauseProduct(product.id)}>
                              Pausar produto
                            </Button>
                          ) : (
                            <Button type="button" size="sm" onClick={() => activateProduct(product.id)}>
                              {product.status === 'rascunho' ? 'Publicar produto' : 'Ativar produto'}
                            </Button>
                          )}
                          <Button type="button" size="sm" variant="ghost" render={<Link to="/lojista/loja" />}>
                            <Store className="size-4" />
                            Ver loja
                          </Button>
                        </div>

                        {editingProductId === product.id && editDraft ? (
                          <div className="mt-2 grid gap-3 rounded-xl bg-surface p-3">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                value={editDraft.name}
                                onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })}
                                placeholder="Nome"
                              />
                              <Input
                                value={editDraft.category}
                                onChange={(event) => setEditDraft({ ...editDraft, category: event.target.value })}
                                placeholder="Categoria"
                              />
                            </div>
                            <Input
                              value={editDraft.description}
                              onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })}
                              placeholder="Descricao"
                            />
                            <div className="grid gap-2 sm:grid-cols-3">
                              <Input
                                value={String(editDraft.price)}
                                onChange={(event) =>
                                  setEditDraft({ ...editDraft, price: Number(event.target.value) || 0 })
                                }
                                placeholder="Preco"
                              />
                              <Input
                                value={String(editDraft.stock)}
                                onChange={(event) =>
                                  setEditDraft({ ...editDraft, stock: Number(event.target.value) || 0 })
                                }
                                placeholder="Estoque"
                              />
                              <Input
                                value={editDraft.sku}
                                onChange={(event) => setEditDraft({ ...editDraft, sku: event.target.value })}
                                placeholder="SKU"
                              />
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                value={editDraft.size}
                                onChange={(event) => setEditDraft({ ...editDraft, size: event.target.value })}
                                placeholder="Tamanho"
                              />
                              <Input
                                value={editDraft.color}
                                onChange={(event) => setEditDraft({ ...editDraft, color: event.target.value })}
                                placeholder="Cor"
                              />
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                value={editDraft.material}
                                onChange={(event) => setEditDraft({ ...editDraft, material: event.target.value })}
                                placeholder="Material"
                              />
                              <Input
                                value={editDraft.model}
                                onChange={(event) => setEditDraft({ ...editDraft, model: event.target.value })}
                                placeholder="Modelo"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={editDraft.status === 'ativo' ? 'default' : 'outline'}
                                onClick={() => setEditDraft({ ...editDraft, status: 'ativo' })}
                              >
                                Ativo
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={editDraft.status === 'pausado' ? 'secondary' : 'outline'}
                                onClick={() => setEditDraft({ ...editDraft, status: 'pausado' })}
                              >
                                Pausado
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" size="sm" onClick={saveChanges}>
                                Salvar alteracoes
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={cancelEditor}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })
            )}
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
        <p className="mt-1 font-heading text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}
