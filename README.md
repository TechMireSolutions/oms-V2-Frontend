# OMS Frontend

Office Management System — Next.js (App Router) + TypeScript + Tailwind CSS frontend.

## Features
- Branded login with token persistence
- SuperAdmin dashboard: dynamic widget grid (react-grid-layout + Recharts)
- Modules: Admissions, Welfare, Finance, Operations, Tasks, Policy, Integrations, Audit, Builder, AI Assistant, Branding
- Schema-driven dynamic form renderer (React Hook Form + Zod) with conditional visibility
- Runtime white-label theming via CSS variables
- Client-side auth guard for protected routes

## Getting started
```bash
pnpm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE at the OMS backend
pnpm dev                     # http://localhost:3000
```

The shared `@oms/dto` (types/Zod schemas) and `@oms/ui` packages are vendored under `packages/`
and linked via the pnpm workspace, so this repo builds standalone.

Requires the OMS backend API running (default `http://localhost:4000`).
