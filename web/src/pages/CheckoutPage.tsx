export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-8 text-4xl font-bold">
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

          
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Endereço de Entrega
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                className="w-full rounded-xl border p-4"
              />

              <input
                type="text"
                placeholder="CEP"
                className="w-full rounded-xl border p-4"
              />

              <input
                type="text"
                placeholder="Rua"
                className="w-full rounded-xl border p-4"
              />

              <input
                type="text"
                placeholder="Número"
                className="w-full rounded-xl border p-4"
              />

              <input
                type="text"
                placeholder="Cidade"
                className="w-full rounded-xl border p-4"
              />
            </div>
          </div>

          
          <div>
            <h2 className="mb-4 text-2xl font-semibold">
              Pagamento
            </h2>

            <div className="space-y-4">
              <button className="w-full rounded-xl border p-4 text-left hover:bg-gray-100">
                Cartão de Crédito
              </button>

              <button className="w-full rounded-xl border p-4 text-left hover:bg-gray-100">
                PIX
              </button>

              <button className="w-full rounded-xl border p-4 text-left hover:bg-gray-100">
                Boleto
              </button>
            </div>

            <div className="mt-10 rounded-2xl bg-gray-100 p-6">
              <div className="flex justify-between">
                <span>Total</span>

                <span className="text-2xl font-bold text-green-600">
                  R$ 399,90
                </span>
              </div>

              <button className="mt-6 w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white transition hover:bg-green-700">
                Finalizar Compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}