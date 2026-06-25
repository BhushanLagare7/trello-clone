# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

**Taskify** is a Trello-style project management application built with **Next.js 16** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS v4**. It uses **Clerk** for auth, **Prisma** (with the `@prisma/adapter-pg` PostgreSQL driver adapter) for the database, **Stripe** for subscription billing, **Unsplash** for board background images, and **shadcn/ui** (radix-vega style) for the component library.

### Key Technologies

| Layer          | Technology                                            |
|----------------|-------------------------------------------------------|
| Framework      | Next.js 16.2.9 (App Router)                           |
| UI / React     | React 19.2.4, Tailwind CSS v4, shadcn/ui (radix-vega) |
| Auth           | Clerk (`@clerk/nextjs`)                               |
| Database       | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` + `pg` |
| Payments       | Stripe (`stripe` SDK)                                 |
| State          | Zustand, TanStack React Query                         |
| Validation     | Zod v4                                                |
| Drag & Drop    | `@hello-pangea/dnd`                                   |
| Package Mgr    | npm (lockfile: `package-lock.json`)                    |

---

## Architecture

### Route Groups

```
app/
├── (marketing)/       # Public landing page
├── (platform)/
│   ├── (clerk)/       # Clerk sign-in / sign-up pages
│   └── (dashboard)/   # Authenticated dashboard (org, board views)
├── api/
│   ├── cards/         # Card detail API endpoint (React Query)
│   └── webhook/       # Stripe webhook handler
├── layout.tsx         # Root layout (fonts, metadata, viewport)
├── globals.css        # Tailwind v4 + CSS variables (theme)
├── robots.ts          # Dynamic robots.txt
└── sitemap.ts         # Dynamic sitemap
```

### Server Actions (`actions/`)

Each action lives in its own directory with three files:

```
actions/<action-name>/
├── index.ts    # "use server" handler (auth → validate → mutate → revalidate)
├── schema.ts   # Zod schema for input validation
└── types.ts    # InputType / ReturnType derived from the schema
```

**Pattern**: All handlers use `createSafeAction(ZodSchema, handler)` from `lib/create-safe-action.ts`.
On the client, call actions via the `useAction` hook (`hooks/use-action.ts`).

Available actions: `create-board`, `delete-board`, `update-board`, `create-list`, `delete-list`, `update-list`, `update-list-order`, `create-card`, `delete-card`, `update-card`, `update-card-order`, `copy-list`, `copy-card`, `stripe-redirect`.

### Core Libraries (`lib/`)

| File                     | Purpose                                                    |
|--------------------------|------------------------------------------------------------|
| `db.ts`                  | Singleton Prisma client with `@prisma/adapter-pg` pool     |
| `create-safe-action.ts`  | Generic Zod-validated server action wrapper                |
| `create-audit-log.ts`    | Writes `AuditLog` entries via Clerk user context            |
| `generate-log-message.ts`| Formats human-readable activity log strings                |
| `org-limit.ts`           | Free-tier board count quota helpers                        |
| `subscription.ts`        | Checks Stripe subscription status for the current org      |
| `stripe.ts`              | Stripe SDK singleton                                       |
| `unsplash.ts`            | Unsplash API client                                        |
| `fetcher.ts`             | Generic `fetch` wrapper for React Query                    |
| `utils.ts`               | `cn()` classname merge + `absoluteUrl()` helper            |

### Components (`components/`)

| Directory        | Contents                                                    |
|------------------|-------------------------------------------------------------|
| `ui/`            | shadcn/ui primitives (button, dialog, popover, sheet, etc.) |
| `form/`          | Reusable form elements (input, textarea, picker, popover, submit, errors) |
| `modals/`        | Card detail modal, Pro upgrade modal                        |
| `providers/`     | `ModalProvider`, `QueryProvider` (TanStack React Query)     |
| Root files       | `logo.tsx`, `hint.tsx` (tooltip wrapper), `activity-item.tsx` |

### Custom Hooks (`hooks/`)

| Hook                  | Purpose                                        |
|-----------------------|------------------------------------------------|
| `use-action.ts`       | Execute server actions with loading/error state |
| `use-card-modal.ts`   | Zustand store for card detail modal open/close  |
| `use-mobile-sidebar.ts` | Zustand store for mobile sidebar toggle      |
| `use-pro-modal.ts`    | Zustand store for pro upgrade modal toggle      |

### Database Schema (`prisma/schema.prisma`)

Models: `Board`, `List`, `Card`, `AuditLog`, `OrgLimit`, `OrgSubscription`.
Enums: `ACTION` (CREATE, UPDATE, DELETE), `ENTITY_TYPE` (BOARD, LIST, CARD).

The Prisma client is generated to `lib/generated/prisma/` (gitignored). Import the client from `@/lib/db` (not directly from the generated folder).

---

## Setup Commands

```bash
# Install all dependencies
npm install

# Generate Prisma client (also runs automatically via postinstall)
npx prisma generate

# Push schema to database (initial setup or schema changes)
npx prisma db push

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## Environment Variables

Create a `.env` file in the project root with these keys:

```env
# Database
DATABASE_URL=                    # PostgreSQL connection string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Unsplash API
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=

# Stripe Billing
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# App URL (used for absolute URL generation and Stripe redirects)
NEXT_PUBLIC_APP_URL=             # e.g. http://localhost:3000
```

> **Important**: `.env*` files are gitignored. Never commit secrets.

---

## Development Workflow

- **Dev server**: `npm run dev` — starts Next.js with hot reload on `http://localhost:3000`.
- **Lint**: `npm run lint` — runs ESLint with the flat config.
- **Lint fix**: `npm run lint:fix` — auto-fix ESLint issues.
- **Formatting**: Prettier is configured (`.prettierrc`) with `prettier-plugin-tailwindcss`. Run `npx prettier --write .` to format.
- **Type check**: `npx tsc --noEmit` — validates TypeScript without emitting.

### After Changing the Prisma Schema

```bash
npx prisma generate     # Regenerate the client
npx prisma db push      # Push changes to the database (dev)
```

### Adding shadcn/ui Components

The project uses shadcn/ui v4 with the `radix-vega` style. Add components with:

```bash
npx shadcn@latest add <component-name>
```

Components install into `components/ui/`. Config is in `components.json`.

---

## Code Style Guidelines

### ESLint

The flat config (`eslint.config.mjs`) enforces:

1. **Next.js core web vitals** and **TypeScript** rules.
2. **JSX prop sorting** (`react/jsx-sort-props`): alphabetical, callbacks last, reserved first.
3. **Import sorting** (`simple-import-sort/imports`) with this group order:
   1. Side-effect imports
   2. React and Next.js
   3. Third-party packages
   4. Internal aliases (`@/`)
   5. Parent imports (`../`)
   6. Sibling imports (`./`)
   7. Catch-all

Always run `npm run lint` before committing to catch violations.

### Prettier

- Plugin: `prettier-plugin-tailwindcss` (auto-sorts Tailwind classes).
- Default Prettier settings apply (no explicit overrides beyond the plugin).

### TypeScript

- Strict mode enabled.
- Path alias: `@/*` maps to the project root.
- Import types from `@/lib/generated/prisma/browser` (browser bundle) for client components, from `@/lib/generated/prisma/client` for server code.

### Naming Conventions

- **Files**: kebab-case (e.g., `create-board/`, `form-input.tsx`).
- **Components**: PascalCase (e.g., `FormInput`, `BoardList`).
- **Server actions**: camelCase exports (e.g., `createBoard`, `deleteCard`).
- **Zustand stores**: `use-<name>.ts` files exporting `use<Name>` hooks.
- **Types**: PascalCase, co-located in `types.ts` within each action directory.

### Patterns to Follow

- **Server actions**: Always use the `createSafeAction` wrapper with a Zod schema. Place in `actions/<action-name>/` with `index.ts`, `schema.ts`, `types.ts`.
- **Client-side action calls**: Use the `useAction` hook with `onSuccess`, `onError`, `onComplete` callbacks.
- **Database access**: Always import `db` from `@/lib/db`. Never instantiate `PrismaClient` directly.
- **Auth checks**: Use `auth()` from `@clerk/nextjs/server` in server actions and API routes.
- **Audit logging**: Call `createAuditLog()` after successful mutations.
- **Board limit enforcement**: Check with `org-limit.ts` helpers; free orgs are limited to `MAX_FREE_BOARDS` (5).
- **Subscription checks**: Use `checkSubscription()` from `lib/subscription.ts` to gate pro features.
- **Revalidation**: Call `revalidatePath()` after mutations to update cached pages.

---

## Build and Deployment

```bash
# Build for production
npm run build

# Start the production server
npm start
```

- **Output**: `.next/` directory (gitignored).
- **Remote images**: `next.config.ts` allows `img.clerk.com` and `images.unsplash.com`.
- **Stripe webhook**: The endpoint is at `app/api/webhook/route.ts`. Configure the Stripe dashboard to point to `<DEPLOYED_URL>/api/webhook`.

---

## Pull Request Guidelines

- **Commit format**: Conventional Commits — `type(scope): subject` (subject ≤ 50 chars).
- **Before committing**: Run `npm run lint` and `npx tsc --noEmit`.
- **Branch naming**: `<type>/<short-description>` (e.g., `feat/card-labels`, `fix/board-delete-crash`).

---

## Common Gotchas

1. **Prisma client location**: Generated to `lib/generated/prisma/` (gitignored). If you get import errors, run `npx prisma generate`.
2. **Prisma driver adapter**: This project uses `@prisma/adapter-pg` with a raw `pg` `Pool` — not the default Prisma connection. Don't add a `url` to `datasource db` in the schema; it's configured in `prisma.config.ts`.
3. **Zod v4**: The project uses Zod v4 (`zod@^4.4.3`). Some APIs differ from Zod v3. Check the Zod v4 docs.
4. **Tailwind CSS v4**: Uses PostCSS-based setup (`@tailwindcss/postcss`). CSS variables and theme are in `app/globals.css`. There is no `tailwind.config.ts` file — configuration is CSS-native.
5. **Next.js 16 breaking changes**: Always consult `node_modules/next/dist/docs/` for the latest API surface. Metadata and Viewport must be separate exports.
6. **Image format**: Board images store a pipe-delimited string (`imageId|thumbUrl|fullUrl|linkHTML|userName`) parsed at creation time.
