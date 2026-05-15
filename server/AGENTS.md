# Hub44 Backend Agent Guide

## Stack Base

- Fastify + TypeScript
- Zod com `fastify-type-provider-zod`
- Drizzle ORM + PostgreSQL
- Supabase Storage para arquivos
- Biome para formatacao

## Architecture

- Rotas ficam em `src/routes`.
- Controllers ficam em `src/controllers` e tratam request/reply.
- Services ficam em `src/services` e concentram regras de negocio.
- Repositories ficam em `src/repositories` e acessam o banco via Drizzle.
- Schemas de banco ficam em `src/db/schema`.
- Utils compartilhados ficam em `src/utils`.

Mantenha o fluxo `routes -> controllers -> services -> repositories`.

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

No PowerShell, prefira `pnpm.cmd` quando `pnpm` for bloqueado pela policy de scripts.

## API Docs

- A documentacao interativa fica em `/docs`.
- Rotas multipart podem nao mostrar o request body completo no Scalar.
- Para uploads, documente campos esperados em arquivos `.md` junto do backend.
- Collections compartilhaveis ficam em `api-clients`.
- Use `api-clients/postman` para collections do Postman.
- Use `api-clients/bruno` para collections do Bruno.

## Storage

- O cliente Supabase fica em `src/lib/supabase.ts`.
- Uploads de imagens usam `src/utils/upload-store-image.ts`.
- O bucket vem de `SUPABASE_STORAGE_BUCKET`.
- Como a API salva `publicUrl`, o bucket precisa estar publico ou expor URL publica valida.

## Validation

- Para JSON, use schemas Zod nas rotas.
- Para `multipart/form-data`, use `request.parts()` via util dedicado e valide campos manualmente.
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

5. Nao reformatar arquivos fora do escopo sem necessidade.
