# SA WebWorks — Booked-Jobs Engine v1 (Template)

Production-ready Next.js template for SA WebWorks client deployments.

## Stack (locked)
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Resend (email notifications)
- Stripe Checkout (deposit scaffold)
- Cloudflare Turnstile + server-side rate limiting
- Vercel deployment target

## Features
- Conversion landing page (`/`) and thank-you page (`/thanks`)
- Lead capture API with validation, anti-spam, idempotency, analytics hooks
- Owner notifications (email, optional SMS log hook)
- Admin login (`/admin/login`) + leads dashboard (`/admin/leads`)
- CSV export and status update APIs
- Supabase migrations + RLS policies
- CI pipeline (lint, typecheck, build)

## Project structure
- `app/(public)/page.tsx` landing page
- `app/(public)/thanks/page.tsx` post-submit page
- `app/admin/login/page.tsx`
- `app/admin/leads/page.tsx`
- `app/api/lead/route.ts`
- `app/api/stripe/checkout/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `lib/*` supabase, validators, rate limit, notifications
- `config/tenant.ts` configurable business details
- `supabase/migrations` schema + RLS

## Environment variables
Copy `.env.example` to `.env.local` and set values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OWNER_EMAIL`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (optional)
- analytics vars (optional)

## Local setup
```bash
pnpm install
pnpm dev
```
Open: `http://localhost:3000`

## Supabase setup
1. Create project in Supabase.
2. Run SQL migration from `supabase/migrations/001_create_leads.sql`.
3. (Optional) run seed from `supabase/seed/demo_leads.sql`.
4. Create admin user in Supabase Auth.
5. Ensure JWT includes `tenant_key` claim for tenant-scoped RLS reads/updates.

## Deploy to Vercel
1. Push repository to GitHub.
2. Import project in Vercel.
3. Set all env vars from `.env.example`.
4. Deploy.
5. Connect domain and DNS.

## Tenant config instructions
Edit `config/tenant.ts` for business-level customizations:
- name/phone/headline
- services list
- suburbs
- FAQs
- trust bar

No code changes required for these basics.

## Weekly KPI checklist template
- Leads received (count)
- Contacted within 5 mins (% of leads)
- Booked jobs (count)
- Win rate (won / total)
- Average time-to-first-contact
- Cost per lead (if paid traffic)
- Top 3 job types by volume

## SOP: Admin operations
- Login at `/admin/login`
- Review new leads in `/admin/leads`
- Update status/notes via admin API (`PATCH /api/admin/lead/:id`)
- Export CSV via `/api/admin/leads?format=csv`
