# Hub44

Projeto integrador do 4 modulo da PUC Goias (Analise e Desenvolvimento de
Sistemas).

O Hub44 e um marketplace com:

- `server`: API Fastify + TypeScript.
- `web`: frontend React + Vite + TypeScript.

## Tecnologias

- Frontend: React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Router,
  TanStack Query.
- Backend: Fastify, Zod, Drizzle ORM, PostgreSQL, Supabase Storage, Kafka.
- Package manager: pnpm.

## Requisitos

- Node.js LTS, recomendado 20+.
- pnpm.
- Docker, para subir Postgres/Kafka localmente.
- Projeto Supabase com bucket publico para imagens.

No PowerShell, prefira `pnpm.cmd`.

## Estrutura

```text
hub44/
  server/   # API
  web/      # Frontend
```

## Variaveis de Ambiente

Crie `server/.env` com:

```env
DATABASE_URL=postgresql://docker:docker@localhost:5432/hub44
JWT_SECRET=uma-chave-com-pelo-menos-32-caracteres
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-jwt
SUPABASE_STORAGE_BUCKET=stores
KAFKA_BROKER=localhost:9092
```

Opcionalmente, crie `web/.env`:

```env
VITE_API_URL=http://localhost:3333
```

## Instalar Dependencias

```bash
cd server
pnpm.cmd install

cd ../web
pnpm.cmd install
```

## Subir Infra Local

Dentro de `server`:

```bash
docker compose up -d postgres zookeeper kafka kafka-init
```

Para subir tambem a API em Docker:

```bash
docker compose up -d
```

## Banco de Dados

Dentro de `server`:

```bash
pnpm.cmd run db:migrate
pnpm.cmd run db:seed
```

O seed cria:

- usuario admin;
- categorias;
- lojas aprovadas com usuarios lojistas;
- enderecos de loja;
- produtos ativos;
- imagens de loja e produto quando encontradas no Supabase Storage.

## Padrao do Supabase Storage

Bucket recomendado: `stores`.

Use slugs para evitar problema com espacos, acentos e IDs antigos:

```text
vitrine-bella/
  logo
  banner
  products/
    blusa-feminina-canelada/
      image-1
      image-2
    calca-pantalona-feminina/
      image-1
```

O seed prioriza `store-slug/products/product-slug`. Caminhos por ID e por
sequencia existem apenas como fallback.

## Rodar em Desenvolvimento

Terminal 1, backend:

```bash
cd server
pnpm.cmd run dev
```

Backend:

- API: `http://localhost:3333`
- Docs: `http://localhost:3333/docs`
- Health: `http://localhost:3333/health`

Terminal 2, frontend:

```bash
cd web
pnpm.cmd run dev
```

Frontend Vite:

- URL padrao: `http://localhost:5173`

## Scripts Uteis

Backend:

```bash
pnpm.cmd run dev
pnpm.cmd run db:generate
pnpm.cmd run db:migrate
pnpm.cmd run db:seed
pnpm.cmd exec tsc --noEmit
pnpm.cmd test
```

Frontend:

```bash
pnpm.cmd run dev
pnpm.cmd run build
pnpm.cmd exec tsc -b
pnpm.cmd test
```

## Fluxos Principais

- Cadastro/login: `/auth/register`, `/auth/login`, `/auth/me`,
  `/auth/refresh`.
- Cadastro publico aceita `role: customer` ou `role: seller`.
- Onboarding de loja: `POST /seller/onboarding`.
- Catalogo publico: `GET /categories`, `GET /stores`, `GET /products`.
- Imagens publicas de produto: `GET /products/:productId/images`.
- Painel lojista: rotas `/seller/*`.
- Carrinho, pedidos, pagamentos e notificacoes usam a API autenticada.

## Validacao Antes de Entregar

Backend:

```bash
cd server
pnpm.cmd exec tsc --noEmit
pnpm.cmd test
```

Frontend:

```bash
cd web
pnpm.cmd exec tsc -b
pnpm.cmd test
```

## Solucao de Problemas

- `pnpm` bloqueado no PowerShell: use `pnpm.cmd`.
- Porta `3333` ocupada: pare o processo atual ou altere `PORT`.
- Imagens erradas no seed: confirme se o bucket usa
  `store-slug/products/product-slug` e rode `pnpm.cmd run db:seed`.
- Bucket sem imagem publica: confira se o bucket esta publico ou se as URLs
  publicas do Supabase estao acessiveis.
