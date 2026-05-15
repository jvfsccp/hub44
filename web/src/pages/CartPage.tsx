export default function CartPage() {
  const cartItems = [
    {
      id: 1,
      nome: 'Tênis Nike Air',
      preco: 399.9,
      quantidade: 1,
      imagem:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    },
  ]

  const total = cartItems.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0,
  )

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-bold">
          Meu Carrinho
        </h1>

        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow"
            >
              <img
                src={item.imagem}
                alt={item.nome}
                className="h-28 w-28 rounded-xl object-cover"
              />

              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {item.nome}
                </h2>

                <p className="text-gray-500">
                  Quantidade: {item.quantidade}
                </p>
              </div>

              <p className="text-2xl font-bold text-green-600">
                R$ {item.preco.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              Total
            </span>

            <span className="text-3xl font-bold text-green-600">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <button className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700">
            Ir para Checkout
          </button>
        </div>
      </div>
    </div>
  )
}