# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Optimize images then build (next build)
npm start            # Start production server
npm run clean        # Remove dist directory
```

Pre-commit hooks run automatically: `eslint --fix` + `prettier --write` on staged files.

## Environment

Copy `.env-example` to `.env` and configure:
- `NEXT_PUBLIC_BASE_URL` — backend API base URL
- `NEXT_PUBLIC_BASE_URL_MEDIA` — media server URL
- `HTTPS`, `SSL_CRT_FILE`, `SSL_KEY_FILE` — optional HTTPS config

## Architecture

**Next.js 15 App Router** + **Feature-Sliced Design (FSD)**. The `src/` directory follows FSD layers with strict dependency direction (app → pages → widgets → features → entities → shared):

```
src/
├── app/           # Next.js routes + root layout + global styles
├── pages_fsd/     # Page-level components (thin wrappers used by app/ routes)
├── features/      # Business logic slices (login, comments, qr-scanner, etc.)
├── entities/      # Domain objects (achievement, post)
├── widgets/       # Composite UI assembled from features/entities
└── shared/        # Cross-cutting concerns:
    ├── api/       # Axios-based domain services (auth, user, posts, data…)
    ├── stores/    # Zustand stores (auth-store, user-store, articles-store…)
    ├── ui/        # Reusable UI components (menu, footer, avatar…)
    ├── lib/ApiSPA # Axios instance + request helpers + API types
    ├── hooks/     # Custom hooks (useApi)
    └── utils/     # Utility functions
```

**Path aliases** (defined in `tsconfig.json`):
- `@/*` → `src/*`
- `@/pages/*` → `src/pages_fsd/*`
- `@/features/*`, `@/entities/*`, `@/widgets/*`, `@/shared/*`, `@/app/*`

## Key Patterns

**State management** — Zustand stores in `shared/stores/`. Auth state lives in `auth-store`, user profile/achievements/balance in `user-store`. Import stores directly; no provider wrapping needed.

**API calls** — Services in `shared/api/` (organized by domain). Each domain folder has an `index.ts` and a `models/` subdirectory for request/response types. The Axios instance and helpers are in `shared/lib/ApiSPA/`.

**Auth flow** — Login → JWT stored in auth-store → `DefaultLayout` (`src/app/DefaultLayout.tsx`) verifies token on every protected page load → redirect to `/user/{username}` on success. Unauthenticated users are redirected to `/login`.

**Styling** — SCSS modules per component + global `globals.scss` + `_mixins.scss`. Ant Design 5 (desktop) and Ant Design Mobile 5 (mobile) for UI primitives.

**API proxying** — `next.config.mjs` rewrites `/api/*` to the backend at `letovocorp.ru`. The `NEXT_PUBLIC_BASE_URL` env var controls the target.

## Stack

React 19, Next.js 15, TypeScript 5, Zustand 5, Ant Design 5 + Ant Design Mobile 5, Axios, Immer, Sass, next-pwa, Docker (standalone output).
