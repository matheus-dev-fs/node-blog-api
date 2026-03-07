# Node Blog API

API simples para gerenciar posts de um blog, com autenticação via **JWT**, validação de payloads com **Zod** e persistência usando **Prisma + PostgreSQL**.

## Stack

- Node.js + TypeScript (`type: module`)
- Express
- Prisma + PostgreSQL (`@prisma/adapter-pg`)
- JWT (`jsonwebtoken`)
- Bcrypt (`bcryptjs`)
- Upload de arquivos (`multer`)
- Validação (`zod`)

## Estrutura (resumo)

- `src/server.ts`  
  Sobe o servidor Express e registra as rotas:
  - `/api/auth` (auth)
  - `/api/admin` (admin, privado)
  - `/api` (rotas públicas)
- `src/routes`
  - `auth.route.ts`
  - `admin.route.ts`
  - `main.route.ts`
- `src/controllers`  
  Controllers separados por contexto (auth, admin, público).
- `src/services`  
  Regras de negócio:
  - `user.service.ts` (criação/autenticação/consulta de usuário)
  - `auth.service.ts` (criar token e validar request)
  - `post.service.ts` (CRUD/listagens de posts)
- `src/middlewares/private-route.middleware.ts`  
  Middleware de rota privada (valida token e injeta `req.user`).
- `src/schemas`  
  Schemas do Zod (`auth.schema.ts`, `post.schema.ts`)
- `src/libs`
  - `prisma.lib.ts` (instância Prisma)
  - `jwt.lib.ts` (criar/ler JWT)
  - `multer.lib.ts` (upload para `tmp/`)
- `src/helpers`
  - `auth.helper.ts` (parse do Bearer token)
  - `request.helper.ts` (page/slug)
  - `slugify.helper.ts` (slug do post)
  - `uploader.helper.ts` (validação e armazenamento de capa)
- `prisma/schema.prisma`  
  Modelos `User` e `Post` + enum `PostStatus`.

## Models (Prisma)

- **User**
  - `name`, `email` (unique), `password`, `status`
- **Post**
  - `title`, `body`, `tags`, `slug` (unique), `status` (DRAFT/PUBLISHED)
  - `cover` (nome do arquivo)
  - relação com `User` via `authorId`

## Variáveis de ambiente

Use o `.env.example` como base:

```env
SERVER_PORT=4444
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
JWT_KEY=sua_chave
BASE_URL=http://localhost:4444
```

> O `BASE_URL` é usado para montar a URL pública da capa em `getCoverUrl`.

## Como rodar

```bash
npm install
npm run dev
```

## Rotas principais

### Público (`/api`)
- `GET /api/ping`
- `GET /api/posts?page=1`  
  Lista posts **publicados** (paginação simples).
- `GET /api/posts/:slug`  
  Detalhe de um post publicado.
- `GET /api/posts/:slug/related`  
  Lista posts com tags relacionadas ao post informado.

### Auth (`/api/auth`)
- `POST /api/auth/signup`  
  Cria usuário e retorna `{ user, token }`
- `POST /api/auth/signin`  
  Autentica usuário e retorna `{ user, token }`
- `POST /api/auth/validate` *(privado)*  
  Valida token e retorna `{ user }`

### Admin (`/api/admin`) *(privado / Bearer token)*
- `POST /api/admin/posts` *(multipart/form-data)*  
  Cria post (exige upload de `cover`)
- `GET /api/admin/posts?page=1`  
  Lista posts do usuário autenticado
- `GET /api/admin/posts/:slug`
- `PUT /api/admin/posts/:slug` *(opcional cover)*
- `DELETE /api/admin/posts/:slug`

## Upload de capa

O upload usa `multer` com destino `tmp/` e depois o helper move a imagem para:

`./public/images/covers/<uuid>.jpg`

Tipos aceitos: `image/jpeg`, `image/jpg`, `image/png`.

## Autenticação

Enviar o token no header:

```http
Authorization: Bearer <token>
```

## Notas

- O projeto usa um tipo `Result<T>` para padronizar retornos dos services.
- Validações de entrada são feitas via Zod e retornam erros por campo (`getZodErrors`).

---
Feito para estudo/prática de uma API de blog em Node.js + TypeScript.