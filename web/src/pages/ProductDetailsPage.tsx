import { useParams } from '@tanstack/react-router'

export default function ProductDetailsPage() {
  const params = useParams({
    from: '/produto/$productId',
  })

  const productId = params.productId

  const product = {
    id: productId,
    nome: 'Tênis Nike Air',
    preco: 399.9,
    descricao:
      'Tênis confortável e moderno para uso diário e esportivo.',
    imagem:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    categoria: 'Calçados',
    estoque: 12,
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-md">
        <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
          <div>
            <img
              src={product.imagem}
              alt={product.nome}
              className="h-[500px] w-full rounded-xl object-cover"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <span className="text-sm text-gray-500">
                {product.categoria}
              </span>

              <h1 className="mt-2 text-4xl font-bold">
                {product.nome}
              </h1>

              <p className="mt-4 text-3xl font-bold text-green-600">
                R$ {product.preco.toFixed(2)}
              </p>

              <p className="mt-6 leading-relaxed text-gray-600">
                {product.descricao}
              </p>

              <div className="mt-6">
                <span className="font-semibold">
                  Estoque:
                </span>{' '}
                {product.estoque} unidades
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                Adicionar ao Carrinho
              </button>

              <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                Comprar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}