# Cadastro de lojas e produtos com imagens

Este guia explica como alimentar o storage e o banco da API com lojas e
produtos. As rotas usam `multipart/form-data`, ou seja, campos de texto e
arquivos no mesmo envio.

Para facilitar o uso pela equipe, o backend ja inclui collections prontas:

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
   precisa permitir acesso publico aos arquivos.

4. Aplique as migrations:

```bash
pnpm.cmd run db:migrate
```

5. Suba a API:

```bash
pnpm.cmd run dev
```

## Como o cadastro funciona

Ao criar uma loja, a API:

1. Recebe `name`, `description`, `logo` e `banner`.
2. Gera o `id` da loja.
3. Envia o logo para `store-id/logo.ext`.
4. Envia o banner para `store-id/banner.ext`.
5. Salva a loja na tabela `stores`, incluindo `logo_url` e `banner_url`.

Ao criar um produto, a API:

1. Recebe o `storeId` na URL.
2. Recebe `name`, `description`, `price` e `image`.
3. Verifica se a loja existe.
4. Converte `price` para centavos e salva em `price_in_cents`.
5. Envia a imagem para `store-id/products/product-id.ext`.
6. Salva o produto na tabela `products`, incluindo `image_url`.

Estrutura esperada no Supabase Storage:

```text
store-id/
  logo.ext
  banner.ext
  products/
    product-id.ext
```

## Usando no Postman

1. Abra o Postman.
2. Clique em `Import`.
3. Selecione o arquivo:

```text
server/api-clients/postman/hub44-storage.postman_collection.json
```

4. Abra a collection `Hub44 Storage API`.
5. Confira se a variavel `baseUrl` esta como:

```text
http://localhost:3333
```

### Criar loja no Postman

1. Abra `Stores > 01 - Criar loja`.
2. Va na aba `Body`.
3. Confira se esta selecionado `form-data`.
4. Preencha ou ajuste:

| Campo | Tipo | Exemplo |
| --- | --- | --- |
| `name` | Text | `Cafeteria Centro` |
| `description` | Text | `Cafeteria com produtos artesanais` |
| `logo` | File | selecione uma imagem |
| `banner` | File | selecione uma imagem |

5. Clique em `Send`.
6. Se a resposta for `201`, a loja foi criada.

A collection do Postman salva automaticamente o `store.id` retornado na
variavel `storeId`. Essa variavel sera usada no cadastro de produto.

Resposta esperada:

```json
{
  "store": {
    "id": "0669f0d4-3e8f-7b54-8000-7f0de05c4812",
    "name": "Cafeteria Centro",
    "description": "Cafeteria com produtos artesanais",
    "logoUrl": "https://PROJECT_ID.supabase.co/storage/v1/object/public/stores/0669f0d4-3e8f-7b54-8000-7f0de05c4812/logo.png",
    "bannerUrl": "https://PROJECT_ID.supabase.co/storage/v1/object/public/stores/0669f0d4-3e8f-7b54-8000-7f0de05c4812/banner.jpg",
    "createdAt": "2026-05-14T22:30:00.000Z",
    "updatedAt": "2026-05-14T22:30:00.000Z"
  }
}
```

### Criar produto no Postman

1. Execute primeiro `Stores > 01 - Criar loja`.
2. Abra `Stores > 02 - Criar produto da loja`.
3. Va na aba `Body`.
4. Confira se esta selecionado `form-data`.
5. Preencha ou ajuste:

| Campo | Tipo | Exemplo |
| --- | --- | --- |
| `name` | Text | `Cafe especial 250g` |
| `description` | Text | `Graos selecionados, torra media` |
| `price` | Text | `39.90` |
| `image` | File | selecione uma imagem |

6. Clique em `Send`.

O campo `price` aceita ponto ou virgula decimal, como `39.90` ou `39,90`.
No banco ele sera salvo como centavos: `3990`.

Resposta esperada:

```json
{
  "product": {
    "id": "0669f0d6-55a4-7c14-8000-832f43f642a4",
    "storeId": "0669f0d4-3e8f-7b54-8000-7f0de05c4812",
    "name": "Cafe especial 250g",
    "description": "Graos selecionados, torra media",
    "priceInCents": 3990,
    "imageUrl": "https://PROJECT_ID.supabase.co/storage/v1/object/public/stores/0669f0d4-3e8f-7b54-8000-7f0de05c4812/products/0669f0d6-55a4-7c14-8000-832f43f642a4.jpg",
    "createdAt": "2026-05-14T22:35:00.000Z",
    "updatedAt": "2026-05-14T22:35:00.000Z"
  }
}
```

## Usando no Bruno

1. Abra o Bruno.
2. Clique em `Open Collection`.
3. Selecione a pasta:

```text
server/api-clients/bruno/hub44-storage-api
```

4. Selecione o ambiente `local`.
5. Confira se a variavel `baseUrl` esta como:

```text
http://localhost:3333
```

### Criar loja no Bruno

1. Abra `stores > 01 - Criar loja`.
2. Abra a aba de body multipart.
3. Ajuste os textos `name` e `description`.
4. Troque os arquivos dos campos `logo` e `banner` por imagens reais.
5. Clique em `Send`.
6. Copie o valor de `store.id` da resposta.

### Criar produto no Bruno

1. Abra o ambiente `local`.
2. Cole o `store.id` da loja na variavel `storeId`.
3. Abra `stores > 02 - Criar produto da loja`.
4. Ajuste `name`, `description` e `price`.
5. Troque o arquivo do campo `image` por uma imagem real.
6. Clique em `Send`.

## Alimentando 10 lojas

Para cadastrar 10 lojas, repita este fluxo:

1. Crie a loja pela collection.
2. Guarde o `store.id`.
3. Cadastre os produtos usando esse `store.id`.
4. Marque a loja como concluida na tabela de controle abaixo.

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
| `400` | Campo obrigatorio ausente, arquivo em campo errado ou arquivo nao imagem |
| `404` | `storeId` inexistente ao cadastrar produto |
| `413` | Imagem maior que o limite configurado no multipart |
| `500` | Falha inesperada no banco ou no Supabase Storage |

O limite atual por arquivo e de 5 MB.
