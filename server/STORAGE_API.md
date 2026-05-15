# Cadastro de lojas, categorias e produtos

Este guia explica como alimentar o banco e o storage da API. A regra atual e:

- Dados estruturados entram como `application/json`.
- Arquivos entram em rota separada com `multipart/form-data`.

Isso deixa o Scalar mais claro e facilita a integracao do frontend.

Collections prontas:

- Postman:
  `api-clients/postman/hub44-storage.postman_collection.json`
- Bruno:
  `api-clients/bruno/hub44-storage-api`

Base local padrao:

```text
http://localhost:3333
```

Documentacao interativa:

```text
http://localhost:3333/docs
```

## Antes de cadastrar

1. Configure o `.env` do backend:

```env
DATABASE_URL=postgresql://docker:docker@localhost:5432/hub44
JWT_SECRET=replace-with-at-least-32-characters-secret
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-service-role-key
SUPABASE_STORAGE_BUCKET=stores
```

2. Garanta que o bucket definido em `SUPABASE_STORAGE_BUCKET` exista no
   Supabase Storage.

3. Como a API salva `publicUrl` no Postgres, o bucket precisa ser publico ou
   permitir acesso publico aos arquivos.

4. Aplique as migrations:

```bash
pnpm.cmd run db:migrate
```

5. Suba a API:

```bash
pnpm.cmd run dev
```

## Fluxo recomendado

1. Registre ou use um usuario existente.
2. Faca login e copie o `accessToken`.
3. Para lojistas, rode o onboarding de loja.
4. Crie uma categoria.
5. Crie os produtos da loja.
6. Envie a imagem de cada produto.

As rotas de categoria, loja, produto e endereco exigem:

```http
Authorization: Bearer ACCESS_TOKEN
```

## Onboarding de lojista

O caminho recomendado para transformar uma conta comum em lojista e criar a
primeira loja e:

```http
POST /seller/onboarding
Content-Type: application/json
Authorization: Bearer ACCESS_TOKEN
```

Body:

```json
{
  "store": {
    "name": "Cafeteria Centro",
    "description": "Cafeteria com produtos artesanais",
    "cnpj": "12345678000190",
    "phone": "62999999999"
  },
  "address": {
    "street": "Rua 44",
    "number": "100",
    "complement": "Loja 12",
    "district": "Centro",
    "city": "Goiania",
    "state": "GO",
    "zipCode": "74000000"
  }
}
```

Ao concluir, a API:

1. Cria a loja com status inicial `pending`.
2. Cria o endereco vinculado a loja.
3. Promove o usuario para role `seller`.
4. Retorna um novo `accessToken` ja com a role atualizada.

Rotas auxiliares para o painel do lojista:

```http
GET /seller/store
PATCH /seller/store
GET /seller/products
POST /seller/products
PATCH /seller/products/:productId
PATCH /seller/products/:productId/status
POST /seller/products/:productId/image
```

Essas rotas exigem usuario autenticado com role `seller` ou `admin`.

No endpoint `POST /seller/products`, a API identifica automaticamente a loja do
usuario autenticado. Se `status` nao for informado, o produto nasce como
`draft`. Os status aceitos para produtos sao:

```text
draft, active, paused, inactive, out_of_stock
```

Exemplo de criacao:

```http
POST /seller/products
Content-Type: application/json
Authorization: Bearer ACCESS_TOKEN
```

```json
{
  "categoryId": "category-id",
  "name": "Cafe especial 250g",
  "description": "Graos selecionados, torra media",
  "priceInCents": 3990,
  "stock": 20,
  "status": "active"
}
```

Para liberar a loja no catalogo publico, um admin deve aprovar o status:

```http
PATCH /admin/stores/:storeId/status
Content-Type: application/json
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

Body:

```json
{
  "status": "approved"
}
```

Statuses aceitos: `pending`, `approved`, `rejected`, `inactive`.

## Catalogo publico

As telas do marketplace podem consumir:

```http
GET /categories
GET /stores
GET /products
```

`GET /stores` retorna apenas lojas com status `approved`.

`GET /products` retorna apenas produtos `active` de lojas `approved` e aceita
filtros opcionais:

```http
GET /products?categoryId=category-id
GET /products?storeId=store-id
```

## Pedidos, Kafka e notificacoes

Pedidos usam as tabelas `orders`, `order_items`, `order_events` e
`notifications`. A API tambem publica eventos no Kafka em:

| Topico | Uso |
| --- | --- |
| `hub44.orders` | Criacao e atualizacao de status de pedidos |
| `hub44.notifications` | Notificacoes para cliente e lojista |

Configure o broker com:

```env
KAFKA_BROKER=localhost:9092
```

Se a publicacao no Kafka falhar durante criacao ou atualizacao de pedido, a API
retorna `503`, porque a emissao dos eventos faz parte obrigatoria do fluxo.

### Criar pedido

```http
POST /orders
Content-Type: application/json
Authorization: Bearer ACCESS_TOKEN
```

Body:

```json
{
  "addressId": "address-id",
  "paymentMethod": "pix",
  "deliveryMethod": "standard",
  "couponCode": "HUB44",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2
    }
  ]
}
```

A API cria um pedido por loja quando o checkout tiver itens de lojas diferentes.

### Consultar pedidos

```http
GET /orders
GET /orders/:orderId
GET /seller/orders
PATCH /seller/orders/:orderId/status
GET /notifications
```

Exemplo para atualizar status pelo lojista:

```json
{
  "status": "shipped",
  "trackingCode": "BR-EXP-998711"
}
```

## Como o cadastro funciona

Ao criar uma loja, a API:

1. Recebe os dados da loja em JSON.
2. Usa o usuario autenticado como `owner_id`.
3. Gera o `slug` automaticamente a partir do `name`, se o `slug` nao vier no
   body.
4. Salva a loja com status inicial `pending`.

Ao criar uma categoria, a API:

1. Recebe os dados da categoria em JSON.
2. Gera o `slug` automaticamente a partir do `name`, se o `slug` nao vier no
   body.
3. Salva a categoria para ser usada nos produtos.

Ao criar um produto, a API:

1. Recebe os dados do produto em JSON.
2. Valida se a loja pertence ao usuario autenticado.
3. Valida se a categoria existe.
4. Gera o `slug` automaticamente a partir do `name`, se o `slug` nao vier no
   body.
5. Salva o produto com status inicial `active`.

Ao enviar a imagem de um produto, a API:

1. Recebe o arquivo no campo `image`.
2. Envia para o Supabase Storage em:

```text
store-id/products/product-id.ext
```

3. Salva a URL publica em `products.image_url`.

## Rotas principais

### Login

```http
POST /auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "equipe@hub44.test",
  "password": "12345678"
}
```

Guarde o `accessToken` retornado.

### Criar categoria

```http
POST /categories
Content-Type: application/json
Authorization: Bearer ACCESS_TOKEN
```

Body:

```json
{
  "name": "Cafes",
  "description": "Produtos de cafeteria e graos especiais"
}
```

Resposta:

```json
{
  "category": {
    "id": "category-id",
    "name": "Cafes",
    "slug": "cafes",
    "description": "Produtos de cafeteria e graos especiais",
    "createdAt": "2026-05-15T11:00:00.000Z",
    "updatedAt": "2026-05-15T11:00:00.000Z"
  }
}
```

Guarde o `category.id`.

### Criar loja

```http
POST /stores
Content-Type: application/json
Authorization: Bearer ACCESS_TOKEN
```

Body:

```json
{
  "name": "Cafeteria Centro",
  "description": "Cafeteria com produtos artesanais",
  "cnpj": "12345678000190",
  "phone": "62999999999"
}
```

Resposta:

```json
{
  "store": {
    "id": "store-id",
    "ownerId": "user-id",
    "name": "Cafeteria Centro",
    "slug": "cafeteria-centro",
    "description": "Cafeteria com produtos artesanais",
    "cnpj": "12345678000190",
    "phone": "62999999999",
    "status": "pending",
    "createdAt": "2026-05-15T11:05:00.000Z",
    "updatedAt": "2026-05-15T11:05:00.000Z"
  }
}
```

Guarde o `store.id`.

### Criar endereco da loja

```http
POST /stores/:storeId/addresses
Content-Type: application/json
Authorization: Bearer ACCESS_TOKEN
```

Body:

```json
{
  "street": "Rua 44",
  "number": "100",
  "complement": "Loja 12",
  "district": "Centro",
  "city": "Goiania",
  "state": "GO",
  "zipCode": "74000000"
}
```

### Criar produto

```http
POST /stores/:storeId/products
Content-Type: application/json
Authorization: Bearer ACCESS_TOKEN
```

Body:

```json
{
  "categoryId": "category-id",
  "name": "Cafe especial 250g",
  "description": "Graos selecionados, torra media",
  "priceInCents": 3990,
  "stock": 20
}
```

Resposta:

```json
{
  "product": {
    "id": "product-id",
    "storeId": "store-id",
    "categoryId": "category-id",
    "name": "Cafe especial 250g",
    "slug": "cafe-especial-250g",
    "description": "Graos selecionados, torra media",
    "priceInCents": 3990,
    "stock": 20,
    "imageUrl": null,
    "status": "active",
    "createdAt": "2026-05-15T11:10:00.000Z",
    "updatedAt": "2026-05-15T11:10:00.000Z"
  }
}
```

Guarde o `product.id`.

### Upload da imagem do produto

```http
POST /stores/:storeId/products/:productId/image
Content-Type: multipart/form-data
Authorization: Bearer ACCESS_TOKEN
```

Campo:

| Campo | Tipo | Obrigatorio |
| --- | --- | --- |
| `image` | arquivo imagem | sim |

Depois do upload, a resposta do produto passa a ter `imageUrl` preenchido.

## Usando no Postman

1. Abra o Postman.
2. Clique em `Import`.
3. Selecione:

```text
server/api-clients/postman/hub44-storage.postman_collection.json
```

4. Execute a sequencia:

| Ordem | Request |
| --- | --- |
| 00 | `Registrar usuario`, se ainda nao existir usuario |
| 01 | `Login` |
| 02 | `Criar categoria` |
| 03 | `Criar loja` |
| 04 | `Criar endereco da loja` |
| 05 | `Criar produto` |
| 06 | `Upload imagem do produto` |

O Postman salva automaticamente `accessToken`, `categoryId`, `storeId` e
`productId` nas variaveis da collection.

No request de upload, selecione um arquivo real no campo `image`.

## Usando no Bruno

1. Abra o Bruno.
2. Clique em `Open Collection`.
3. Selecione:

```text
server/api-clients/bruno/hub44-storage-api
```

4. Selecione o ambiente `local`.
5. Execute `01 - Login`.
6. Copie o `accessToken` da resposta e cole na variavel `accessToken`.
7. Execute `02 - Criar categoria` e copie `category.id` para `categoryId`.
8. Execute `03 - Criar loja` e copie `store.id` para `storeId`.
9. Execute `04 - Criar endereco da loja`.
10. Execute `05 - Criar produto` e copie `product.id` para `productId`.
11. Execute `06 - Upload imagem do produto` selecionando uma imagem real.

## Alimentando 10 lojas

Para cadastrar 10 lojas:

1. Crie as categorias que serao usadas.
2. Para cada loja, rode `Criar loja`.
3. Cadastre o endereco da loja.
4. Cadastre os produtos usando o `storeId` e o `categoryId`.
5. Envie a imagem de cada produto.
6. Confira no Supabase Storage se as imagens ficaram em:

```text
store-id/
  products/
    product-id.ext
```

Modelo de controle para equipe:

| Loja | Status loja | Store ID | Produtos cadastrados |
| --- | --- | --- | --- |
| Loja 01 | pendente |  | 0 |
| Loja 02 | pendente |  | 0 |
| Loja 03 | pendente |  | 0 |
| Loja 04 | pendente |  | 0 |
| Loja 05 | pendente |  | 0 |
| Loja 06 | pendente |  | 0 |
| Loja 07 | pendente |  | 0 |
| Loja 08 | pendente |  | 0 |
| Loja 09 | pendente |  | 0 |
| Loja 10 | pendente |  | 0 |

## Erros comuns

| Status | Causa comum |
| --- | --- |
| `400` | Campo obrigatorio ausente, slug invalido ou arquivo nao imagem |
| `401` | Token ausente, invalido ou expirado |
| `403` | Usuario autenticado nao e dono da loja |
| `404` | Loja, categoria ou produto inexistente |
| `409` | Slug ou CNPJ ja cadastrado |
| `413` | Imagem maior que o limite configurado no multipart |
| `500` | Falha inesperada no banco ou no Supabase Storage |

O limite atual por arquivo e de 5 MB.
