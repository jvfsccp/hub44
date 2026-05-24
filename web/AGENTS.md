# Hub44 Frontend Agent Guide

## Stack Base

- React 19 + Vite + TypeScript.
- Tailwind CSS v4 com tokens em `src/global.css`.
- shadcn/ui com Base UI.
- TanStack Router em `src/routes`.
- TanStack Query para dados remotos.
- Lucide React para icones.
- Biome para formatacao/checks.

## Design Rules

- Use os tokens definidos em `src/global.css` e siga `DESIGN.md`.
- Nomeie arquivos com hifens (`user-card.tsx`, `settings-page.tsx`).
- Preserve o estilo editorial do marketplace e as telas densas do painel.
- Use icones Lucide em botoes quando houver icone adequado.
- Evite cards dentro de cards e alteracoes visuais fora do escopo.
- Garanta que textos caibam em mobile e desktop.

## Color Naming

- Fundos: `bg-surface`, `bg-surface-alt`, `bg-surface-raised`.
- Acoes/estados: `bg-primary`, `bg-secondary`, `bg-muted`.
- Erros: `bg-error`, `bg-destructive`.
- Texto: `text-foreground`, `text-foreground-subtle`,
  `text-muted-foreground`, `text-primary-foreground`.
- Bordas: `border-border`, `border-input`, `border-primary`,
  `border-destructive`.
- Foco: `ring-ring`.

## API e Auth

- A base da API vem de `VITE_API_URL`; fallback local:
  `http://localhost:3333`.
- Use `apiRequest` em `src/lib/api.ts` para chamadas HTTP.
- Use `resolveApiAssetUrl` para imagens relativas retornadas pela API.
- O cadastro envia `role: customer` ou `role: seller`.
- Login salva access token em `localStorage` e usa cookie de refresh da API.

## Catalogo e Imagens

- Tipos e chamadas de catalogo ficam em `src/lib/catalog.ts`.
- Produtos usam `imageUrl` e `imageUrls`.
- Normalize imagens de produto com `getProductImageUrls` em
  `src/lib/product-images.ts`.
- Nao use fallback local quando a API retornar imagem valida.

## Routing

- Institucional: `/`.
- Login/cadastro: `/login`, `/cadastro`.
- Marketplace: `/marketplace`, `/marketplace/produtos`,
  `/marketplace/lojas`, `/produto/$productId`.
- Cliente: `/cliente/pedidos`, carrinho e checkout.
- Lojista: `/lojista/dashboard`, `/lojista/produtos`,
  `/lojista/produtos/novo`, `/lojista/loja`, `/lojista/pedidos`.

## Expected Workflow

1. Ajustar libs em `src/lib` antes de duplicar logica em telas.
2. Criar/ajustar componentes em `src/components` quando forem reutilizaveis.
3. Validar no fluxo real em `src/routes` sempre que possivel.
4. Rodar TypeScript:

```bash
pnpm.cmd exec tsc -b
```

5. Rodar testes:

```bash
pnpm.cmd test
```

6. Rodar Biome nos arquivos alterados:

```bash
pnpm.cmd exec biome check <arquivos>
```
