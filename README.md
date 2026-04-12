# hub44

Projeto integrador do 4 modulo da PUC Goias (Analise e Desenvolvimento de Sistemas).

Aplicacao separada em duas partes:
- `web` (frontend) com React + Vite + TypeScript
- `server` (backend) com Fastify + TypeScript

## Tecnologias principais

- Frontend: React 19, Vite, TypeScript, Tailwind CSS
- Backend: Fastify, Zod, Swagger/Scalar
- Gerenciador de pacotes: **pnpm**

---

## Pre-requisitos

Antes de iniciar, instale:
- Node.js LTS (recomendado: 20+)
- pnpm

### Como instalar o pnpm

Escolha uma das opcoes abaixo:

#### Opcao 1 (recomendada): Corepack (ja vem com Node moderno)

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

#### Opcao 2: via npm global

```bash
npm install -g pnpm
pnpm -v
```

Se o comando `pnpm -v` retornar a versao, esta tudo pronto.

---

## Estrutura do projeto

```text
hub44/
  server/   # API (backend)
  web/      # Interface (frontend)
```

---

## Passo a passo para iniciar o projeto

### 1) Clonar o repositorio

```bash
git clone <url-do-repositorio>
cd hub44
```

### 2) Instalar dependencias

Como o projeto esta separado em `server` e `web`, instale em cada pasta:

### Backend

```bash
cd server
pnpm install
```

### Frontend

```bash
cd ../web
pnpm install
```

---

### 3) Rodar o backend

No terminal, dentro de `server`:

```bash
pnpm dev
```

Backend padrao:
- API: `http://localhost:3333`
- Documentacao (Swagger/Scalar): `http://localhost:3333/docs`

---

### 4) Rodar o frontend

No terminal, dentro de `web`:

```bash
pnpm dev
```

Frontend (Vite):
- URL local exibida no terminal (geralmente `http://localhost:5173`)

---

## Rodando frontend e backend ao mesmo tempo

Abra **dois terminais**:

Terminal 1 (backend):
```bash
cd server
pnpm install
pnpm dev
```

Terminal 2 (frontend):
```bash
cd web
pnpm install
pnpm dev
```

---

## Scripts uteis

### Backend (`server/package.json`)
- `pnpm dev` - inicia a API em modo desenvolvimento
- `pnpm start` - inicia a API a partir de `dist/server.js` (requer build previo)
- `pnpm format` - formata codigo com Biome

### Frontend (`web/package.json`)
- `pnpm dev` - inicia o Vite em desenvolvimento
- `pnpm build` - gera build de producao
- `pnpm preview` - visualiza localmente a build gerada

---

## Solucao de problemas

- Erro: `pnpm: command not found`
  - Reinstale o pnpm e reinicie o terminal.
- Porta `3333` ocupada (backend)
  - Encerre o processo que esta usando a porta ou altere a porta no servidor.
- Dependencias quebradas
  - Apague `node_modules` da pasta afetada e rode `pnpm install` novamente.

---

## Boas praticas

- Use sempre **pnpm** para manter consistencia com os arquivos de lock (`pnpm-lock.yaml`).
- Nao misture com `npm install` ou `yarn` neste repositorio.
- Mantenha frontend e backend em terminais separados durante o desenvolvimento.

---

## Instituicao e contexto academico

Este projeto foi desenvolvido como parte do **Projeto Integrador do 4 modulo** do curso de **Analise e Desenvolvimento de Sistemas** da **PUC Goias**.

---

Feito com foco em aprendizado pratico, organizacao em camadas (frontend/backend) e boas praticas de desenvolvimento moderno.
