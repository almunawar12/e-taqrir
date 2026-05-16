# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**E-Taqrir** — pesantren (Islamic boarding school) report card management platform. Replaces manual spreadsheets with role-based approval workflows, assessment tracking, tahfiz/conduct scoring, and PDF report distribution.

## Commands

### Development

```bash
composer dev       # Concurrent: Laravel serve + queue + pail logs + Vite (start here)
composer setup     # First-time: install, .env, key, migrate, npm build
```

### Frontend

```bash
npm run dev          # Vite hot reload
npm run build        # Production bundle
npm run lint         # ESLint strict (no warnings allowed)
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Prettier format
npm run format:check # Check formatting
npm run type-check   # TypeScript check (no emit)
```

### Backend

```bash
php artisan serve           # Laravel dev server :8000
php artisan migrate         # Run migrations
php artisan queue:listen    # Process queued jobs
php artisan pail            # Stream app logs
composer test               # Clear config + run Pest tests
php artisan test --filter=TestName  # Single test
```

### Code Quality

```bash
./vendor/bin/pint           # PHP code style (Laravel Pint)
./vendor/bin/phpstan analyse # Static analysis (Larastan)
```

## Architecture

### Stack

- **Backend:** Laravel 12 + PHP 8.2
- **Frontend:** React 18 + TypeScript 5 via **Inertia.js** (no separate SPA — server renders pages, Inertia handles navigation)
- **Styling:** Tailwind CSS 3 with custom Material 3 color palette (primary green `#004532`)
- **Auth/RBAC:** Laravel Sanctum + Spatie Permission
- **State Machine:** Spatie Model States (Assessment lifecycle)
- **Testing:** Pest 3 with SQLite in-memory
- **Queue:** Database driver (no Redis — intentional MVP choice)

### Domain Structure

```
app/Domain/
├── Assessment/   # Business logic for assessment lifecycle
├── Audit/        # Immutable audit trail operations
├── Import/       # CSV/XLSX import pipeline (chunked, partial-commit)
└── Report/       # PDF generation (Browsershot/Chromium) + distribution
```

### Assessment Workflow (State Machine)

```
draft → submitted → verified → published
                 ↘ rejected
```

- **Guru Mapel** creates and submits assessments
- **Wali Kelas** verifies submitted assessments
- **Super Admin** publishes verified assessments to Wali Santri

### Roles (Spatie Permission RBAC)

| Role | Scope |
|------|-------|
| `super_admin` | Full system access, publish reports |
| `wali_kelas` | Verify assessments for their classroom |
| `guru_mapel` | Create/submit assessments for their subjects |
| `wali_santri` | Read-only access to their child's published reports |

Users can hold multiple roles and switch active roles via `RoleSwitcher` component (tracked in audit logs).

### Frontend Patterns

- **Pages** (`resources/js/Pages/`) — Inertia page components, one per route
- **Components** (`resources/js/Components/`) — Shared UI: `DataTable.tsx` (TanStack), `FormField.tsx` (Zod-integrated), `RoleSwitcher.tsx`
- **Hooks** (`resources/js/hooks/`) — `useActiveRole.ts`, `useConfirm.tsx`
- Path alias `@/*` maps to `resources/js/*`
- Zod for frontend validation; Laravel `FormRequest` for backend validation

### Key Decisions

- **Database queue/cache/sessions** — all DB-driven for auditability and simplicity (no Redis infra)
- **S3 storage** — presigned URLs for PDFs and evidence files; local disk in dev
- **SendGrid** — mail transport in production; `log` driver in dev
- **Inertia SSR** — single monorepo, no separate API/frontend repos

## Environment

Key `.env` variables beyond defaults:

```env
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local          # or s3 in production
MAIL_MAILER=log                # or sendgrid in production
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000
```

## Reference Docs

- `PRD.md` — Full product spec, user flows, database schema
- `plan.md` — 12-week phased rollout plan (current status: mid-Phase 2)
