# SA WebWorks — Booked‑Jobs Engine

Client-grade template for deploying a production marketing site + lead pipeline per trade business.

## What ships
- Next.js App Router + TypeScript app (deploy to Vercel)
- Marketing pages: `/`, `/services`, `/areas`, `/pricing`, `/about`, `/contact`, `/privacy`, `/pay`
- Quote funnel with validation, rate-limit, captcha hook, and UTM capture
- Lead pipeline: DB write → owner notification → lead confirmation → redirect to `/thanks`
- Auth-protected admin dashboard at `/admin` with filters, status/notes updates, and CSV export
- Analytics events: `call_click`, `quote_submit`, `quote_success`
- Stripe deposit page + webhook scaffold to mark lead as `deposit_paid`
- Supabase migrations + RLS in `supabase/migrations`
- Public GitHub Pages marketing homepage in `docs/`

## Tech stack (locked)
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Postgres + Auth
- Resend (email notifications)
- Stripe Checkout
- Cloudflare Turnstile (server verification hook)
- Vercel deployment target

## Run locally
```bash
pnpm install
pnpm dev
```

## Environment variables
See `.env.example`.

## Tenant configuration
Edit `config/tenant.ts` (business name, phone, services, suburbs, trust badges, FAQs, pricing).

## Database
Run migration:
- `supabase/migrations/001_create_leads.sql`

Optional seed:
- `supabase/seed/demo_leads.sql`

## Admin
- Login: `/admin/login`
- Dashboard: `/admin`

## API routes
- `POST /api/lead`
- `GET /api/admin/leads` (+ `status`, `job_type`, `suburb`, `from`, `to`, `format=csv`)
- `PATCH /api/admin/lead/:id`
- `POST /api/stripe/checkout`
- `POST /api/webhooks/stripe`

## Deployment
Full steps are in `DEPLOYMENT.md`.

## GitHub Pages
This repo includes a client-friendly static site under `docs/`.
Set GitHub Pages Source to:
- Branch: `main`
- Folder: `/docs`

This prevents GitHub Pages from rendering repository README as the homepage.
