import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'

import productSneakerImage from '@/assets/stitch/product-sneaker.png'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApiError, getAccessToken } from '@/lib/api'
import { addCartItem, cartQueryKeys } from '@/lib/cart'
import { catalogQueryKeys, listProducts } from '@/lib/catalog'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function ProdutoDetalhePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const params = useParams({ from: '/produto/$productId' })
  const [feedback, setFeedback] = useState<string | null>(null)
  const hasToken = Boolean(getAccessToken())

  const productsQuery = useQuery({
    queryKey: catalogQueryKeys.products(),
    queryFn: () => listProducts(),
  })
  const product = useMemo(
    () =>
      productsQuery.data?.products.find((item) => item.id === params.productId),
    [params.productId, productsQuery.data?.products],
  )
  const addToCartMutation = useMutation({
    mutationFn: () => addCartItem({ productId: params.productId, quantity: 1 }),
    onSuccess: () => {
      setFeedback('Produto adicionado ao carrinho.')
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all })
    },
    onError: (error) => {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel adicionar ao carrinho.',
      )
    },
  })

  async function handleBuyNow() {
    if (!hasToken) {
      navigate({ to: '/login' })
      return
    }

    try {
      await addCartItem({ productId: params.productId, quantity: 1 })
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all })
      navigate({ to: '/checkout' })
    } catch (error) {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : 'Nao foi possivel iniciar a compra.',
      )
    }
  }

  if (productsQuery.isLoading) {
    return (
      <main className="grid min-h-[calc(100vh-92px)] place-items-center px-6 py-10 text-foreground-subtle">
        Carregando produto...
      </main>
    )
  }

  if (!product) {
    return (
      <main className="grid min-h-[calc(100vh-92px)] place-items-center px-6 py-10">
        <div className="text-center">
          <p className="font-medium text-foreground">Produto nao encontrado.</p>
          <Button className="mt-4" render={<Link to="/marketplace" />}>
            Voltar ao marketplace
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-92px)] bg-surface-alt px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-surface shadow-[0_18px_40px_-14px_rgba(15,23,42,0.18)]">
        <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 md:p-8">
          <div>
            <img
              src={product.imageUrl ?? productSneakerImage}
              alt={product.name}
              className="h-[500px] w-full rounded-2xl object-cover"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <Badge variant="outline">{product.categoryName}</Badge>

              <h1 className="mt-4 font-heading text-4xl font-bold text-foreground">
                {product.name}
              </h1>
              <p className="mt-2 text-sm font-medium text-foreground-subtle">
                Vendido por {product.storeName}
              </p>

              <p className="mt-5 font-heading text-3xl font-bold text-primary">
                {currency.format(product.priceInCents / 100)}
              </p>

              <p className="mt-6 leading-relaxed text-foreground-subtle">
                {product.description ?? 'Produto ativo no catalogo Hub44.'}
              </p>

              <div className="mt-6 text-sm text-foreground">
                <span className="font-semibold">Estoque:</span> {product.stock}{' '}
                unidades
              </div>

              {feedback ? (
                <div className="mt-5 rounded-xl bg-secondary/12 px-3 py-2 text-sm text-secondary-foreground">
                  {feedback}
                </div>
              ) : null}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                className="h-11 rounded-xl px-6"
                disabled={product.stock <= 0 || addToCartMutation.isPending}
                onClick={() => {
                  if (!hasToken) {
                    navigate({ to: '/login' })
                    return
                  }

                  addToCartMutation.mutate()
                }}
              >
                <ShoppingCart className="size-4" />
                Adicionar ao carrinho
              </Button>

              <Button
                variant="secondary"
                className="h-11 rounded-xl px-6"
                disabled={product.stock <= 0}
                onClick={handleBuyNow}
              >
                Comprar agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
