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
# SA WebWorks — Finite Linear Negentropy Algorithm (FLNA)

This repository now ships a **real operational architecture** for SA WebWorks to reduce client-local entropy and automate revenue generation for South Australian tradies.

## Mission Fit

- End the 7 PM–10 PM "Second Shift".
- Seal the leaky lead bucket with rapid capture and deterministic workflows.
- Filter tyre-kickers and out-of-area noise before humans waste time.
- Tie all operations to `sawebworks.com.au` trust signals and role-based governance.

## Service Features

The Python service (`src/sa_webworks_service.py`) provides:

1. **Ingestion**: structured lead capture (`POST /api/leads`).
2. **Filtration**: auto-reject out-of-service suburbs based on config.
3. **State Transition**: finite pipeline states (`new_lead` → `retainer_review`).
4. **Output Generation**: deterministic next-actions + event logging.
5. **Entropy Tracking**: computed `entropy_score` per lead.
6. **Revenue Tracking**: projected revenue summary endpoint.

## API

- `GET /api/health` — health, domain, role inbox, notification SLO.
- `GET /api/pipeline/states` — finite state machine states.
- `POST /api/leads` — create/qualify/filter a lead.
- `GET /api/leads` — list recent leads.
- `GET /api/revenue-summary` — projected revenue + average entropy.

## Local Run

```bash
./scripts/run_service.sh
```

Then visit `http://localhost:8080/api/health`.

## Validation

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
python3 -m py_compile src/sa_webworks_service.py tests/test_service_logic.py
```

## Architecture Assets Added

- `.github/workflows/` — deploy, schema validation, and weekly backups.
- `ops/checklists/` — dry-run and handover controls.
- `ops/templates/` — canned replies and invoice templates.
- `ops/db/` — migration SQL.
- `config/site_config.json` — SA market and trust configuration.

This gives SA WebWorks a practical "Agency-in-a-Box" baseline that can be cloned and tailored for each tradie vertical while preserving deterministic quality.
