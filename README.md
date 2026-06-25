<div align="center">

<img src="./public/logo.svg" alt="Taskify logo" height="64" />

# Taskify

A full-stack Kanban board application for collaborative project management, built with Next.js 16, Prisma, and Stripe.

![Next.js](https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?style=flat-square&logo=prisma&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=flat-square&logo=stripe&logoColor=white)

[Overview](#overview) · [Features](#features) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Deployment](#deployment)

</div>

## 📋 Overview

Taskify is a Trello-inspired project management tool that lets teams organize work using boards, lists, and cards. It supports multi-tenant organizations with Clerk authentication, drag-and-drop reordering, Unsplash-powered board backgrounds, activity logging, and a Stripe-powered Pro subscription tier.

## ✨ Features

- 📌 **Boards, Lists & Cards** — Create and manage Kanban boards with nested lists and cards. Each board can have a custom background from Unsplash.
- 🔀 **Drag & Drop** — Reorder lists and cards across the board using `@hello-pangea/dnd`.
- 🏢 **Organization Workspaces** — Multi-tenant support via Clerk organizations with role-based access.
- 📜 **Activity Audit Log** — Track all create, update, and delete actions with user attribution.
- 🗂️ **Card Detail Modal** — View and edit card details including descriptions, with inline editing.
- 💎 **Pro Subscription** — Stripe integration for upgrading organizations from the free tier (5 boards) to unlimited boards.
- 📱 **Responsive Design** — Mobile-first layout with collapsible sidebar navigation.
- 🔍 **SEO Optimized** — Dynamic metadata, sitemap, robots.txt, and JSON-LD structured data.

## 🛠️ Tech Stack

| Layer          | Technology                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| ⚡ Framework   | [Next.js 16](https://nextjs.org/) (App Router)                                                                  |
| 🟦 Language    | [TypeScript 5](https://www.typescriptlang.org/)                                                                 |
| 🎨 UI          | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| 🔐 Auth        | [Clerk](https://clerk.com/)                                                                                     |
| 🗄️ Database    | [PostgreSQL](https://www.postgresql.org/) via [Prisma 7](https://www.prisma.io/)                                |
| 💳 Payments    | [Stripe](https://stripe.com/)                                                                                   |
| 🧠 State       | [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query)                          |
| 🖱️ Drag & Drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)                                                        |
| 🖼️ Images      | [Unsplash API](https://unsplash.com/developers)                                                                 |
| ✅ Validation  | [Zod 4](https://zod.dev/)                                                                                       |

## 🚀 Getting Started

### Prerequisites

Make sure you have the following ready:

- 🟢 [Node.js](https://nodejs.org/) 20+
- 🐘 [PostgreSQL](https://www.postgresql.org/) database (e.g. [Neon](https://neon.tech/), [Supabase](https://supabase.com/))
- 🔑 [Clerk](https://clerk.com/) account
- 💳 [Stripe](https://stripe.com/) account
- 📷 [Unsplash](https://unsplash.com/developers) developer app

### 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/BhushanLagare7/trello-clone.git
   cd trello-clone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in the values (see [Environment Variables](#environment-variables) below).

4. **Generate Prisma client & push schema**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

### 🔧 Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Database (PostgreSQL connection string)
DATABASE_URL=postgresql://...

# Unsplash
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=...

# Stripe
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> [!TIP]
> For the Stripe webhook in local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events:
>
> ```bash
> stripe listen --forward-to localhost:3000/api/webhook
> ```

## 🏗️ Project Structure

```
├── actions/              # Type-safe server actions (CRUD for boards, lists, cards)
├── app/
│   ├── (marketing)/      # Public landing page & SEO components
│   ├── (platform)/       # Authenticated app (dashboard, boards, billing)
│   └── api/              # API routes (cards, Stripe webhook)
├── components/
│   ├── form/             # Reusable form components (input, picker, popover)
│   ├── modals/           # Card detail & Pro upgrade modals
│   ├── providers/        # Context providers (query, modal)
│   └── ui/               # shadcn/ui primitives
├── config/               # Site-wide configuration
├── constants/            # App constants (board limits)
├── hooks/                # Custom React hooks (useAction, useCardModal, useProModal)
├── lib/                  # Utilities, DB client, Stripe, Unsplash, audit logging
├── prisma/               # Prisma schema (Board, List, Card, AuditLog, OrgLimit, OrgSubscription)
└── public/               # Static assets (logo, hero, OG image)
```

## 📜 Available Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `npm run dev`      | 🔄 Start the development server |
| `npm run build`    | 📦 Create a production build    |
| `npm start`        | ▶️ Run the production server    |
| `npm run lint`     | 🔎 Run ESLint                   |
| `npm run lint:fix` | 🔧 Run ESLint with auto-fix     |

## 🌐 Deployment

The easiest way to deploy is with [Vercel](https://vercel.com/):

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Add all environment variables in the Vercel dashboard.
4. Set up the Stripe webhook endpoint to point to `https://your-domain.com/api/webhook`.
