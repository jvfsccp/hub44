# Hub44 Backend Agent Guide

## Stack Base

- Fastify 5 + TypeScript.
- Zod com `fastify-type-provider-zod`.
- Drizzle ORM + PostgreSQL.
- Supabase Storage para logos, banners e imagens de produtos.
- JWT + cookie de refresh para autenticacao.
- Kafka para eventos de pedidos e notificacoes.
- Biome para formatacao/checks.

## Architecture

- Rotas ficam em `src/routes`.
- Controllers ficam em `src/controllers` e tratam request/reply.
- Services ficam em `src/services` e concentram regras de negocio.
- Repositories ficam em `src/repositories` e acessam o banco via Drizzle.
- Schemas de banco ficam em `src/db/schema`.
- Utils compartilhados ficam em `src/utils`.

Mantenha o fluxo `routes -> controllers -> services -> repositories`.

## Auth e Lojista

- `POST /auth/register` aceita `role` opcional apenas como `customer` ou
  `seller`; nunca permita cadastro publico de `admin`.
- Login retorna access token e grava refresh token em cookie HTTP-only.
- Conta `seller` pode acessar as rotas `/seller/*`.
- O onboarding de loja continua em `POST /seller/onboarding` para criar loja e
  endereco quando necessario.

## Catalogo e Imagens

- `products.image_url` guarda a imagem principal por compatibilidade.
- A galeria fica em `product_images`.
- `GET /products` ja retorna `imageUrl` e `imageUrls`.
- `GET /products/:productId/images` lista as imagens publicas do produto.
- `GET /seed/images/:kind/:slug.svg` existe apenas como fallback visual do seed.

## Storage

- O cliente Supabase fica em `src/lib/supabase.ts`.
- Uploads usam `src/utils/upload-store-image.ts`.
- O bucket vem de `SUPABASE_STORAGE_BUCKET`.
- Como a API salva `publicUrl`, o bucket precisa estar publico ou expor URL
  publica valida.

Padrao recomendado dentro do bucket:

```text
store-slug/
  logo
  banner
  products/
    product-slug/
      image-1
      image-2
```

O seed tambem tenta caminhos antigos por ID e por sequencia, mas slug exato deve
ser a fonte confiavel.

## Database

- Atualize schemas em `src/db/schema`.
- Exporte novos schemas em `src/db/schema/index.ts`.
- Gere migrations com:

```bash
pnpm.cmd run db:generate
```

- Aplique migrations com:

```bash
pnpm.cmd run db:migrate
```

- Rode seeds com:

```bash
pnpm.cmd run db:seed
```

No PowerShell, prefira `pnpm.cmd`.

## API Docs

- A documentacao interativa fica em `/docs`.
- Rotas multipart podem nao mostrar o request body completo no Scalar.
- Para uploads, documente campos esperados em arquivos `.md` junto do backend.
- Collections ficam em `api-clients/postman` e `api-clients/bruno`.

## Validation

- Para JSON, use schemas Zod nas rotas.
- Para `multipart/form-data`, use `request.parts()` via util dedicado e valide
  campos manualmente.
- Cadastros de dados devem usar JSON; reserve multipart para upload de arquivos.
- Precos de produtos sao persistidos como `price_in_cents`.

## Expected Workflow

1. Entender o padrao local antes de implementar.
2. Fazer mudancas pequenas e coesas.
3. Rodar TypeScript:

```bash
pnpm.cmd exec tsc --noEmit
```

4. Rodar Biome nos arquivos alterados:

```bash
pnpm.cmd exec biome check <arquivos>
```

5. Rodar testes relevantes:

```bash
pnpm.cmd test
```

6. Nao reformatar arquivos fora do escopo sem necessidade.

## Commits

- Use Conventional Commits em mensagens curtas e diretas.
- Exemplos: `feat: allow seller registration`, `fix: map seed images`,
  `docs: update backend guide`.
