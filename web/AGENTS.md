# Hub44 Frontend Agent Guide

## Stack Base
- React + Vite + TypeScript
- Tailwind CSS v4 com tokens em `src/global.css`
- shadcn/ui com Base UI (configurado em `components.json`)
- TanStack Router (rotas em `src/routes`)
- Lucide para icones

## Design Rules
- Use os tokens definidos em `src/global.css` e siga `DESIGN.md`.
- Nomeie arquivos com hifens (`user-card.tsx`, `settings-page.tsx`).
- Evite UI generica: preserve o estilo editorial do Hub44.
- Preferir separacao visual por superficies e espacamento em vez de bordas fortes.

## Color Naming (cores.md)
- Fundos: `bg-surface`, `bg-surface-raised`
- Acoes/estados: `bg-primary`, `bg-secondary`, `bg-muted`
- Erros: `bg-destructive`
- Texto: `text-foreground`, `text-foreground-subtle`, `text-muted-foreground`, `text-primary-foreground`
- Bordas: `border-border`, `border-input`, `border-primary`, `border-destructive`
- Foco: `ring-ring`

## Typography
- Heading: Poppins (600/700)
- Body: Inter (400/500/600)

## Routing
- Home: `/`
- Preview de componentes: `/components-preview`

## Expected Workflow
1. Criar/ajustar componente em `src/components`.
2. Expor/validar visual em `/components-preview` quando fizer sentido.
3. Rodar `pnpm build` antes de finalizar alteracoes.
