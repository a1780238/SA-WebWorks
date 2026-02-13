# DEPLOYMENT.md

## 1) Create Supabase project
1. Create project in Supabase.
2. Run `supabase/migrations/001_create_leads.sql` in SQL Editor.
3. (Optional) run `supabase/seed/demo_leads.sql`.
4. Create admin user in Supabase Auth.
5. Ensure JWT includes `tenant_key` claim for tenant-scoped RLS.

## 2) Configure environment variables
In Vercel Project Settings → Environment Variables, set all from `.env.example`:
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_TENANT_KEY`
- `NEXT_PUBLIC_BUSINESS_NAME`
- `NEXT_PUBLIC_TRADE_HEADLINE`
- `NEXT_PUBLIC_BUSINESS_PHONE`
- `NEXT_PUBLIC_BUSINESS_ADDRESS`
- `OWNER_EMAIL`
- `OWNER_SMS` (optional)
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `RESEND_API_KEY`
- `MAIL_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- analytics vars (optional)

## 3) Deploy app to Vercel
1. Import repository into Vercel.
2. Select Node runtime defaults.
3. Deploy.
4. Connect production domain.

## 4) Stripe webhook
1. Create webhook endpoint: `https://<your-domain>/api/webhooks/stripe`.
2. Subscribe to `checkout.session.completed`.
3. Set `STRIPE_WEBHOOK_SECRET`.

## 5) Test lead flow (acceptance)
1. Open site home page.
2. Submit quote form.
3. Verify owner receives email (and optional SMS log).
4. Verify lead confirmation is sent.
5. Verify lead appears in `/admin`.
6. Update lead status/notes.
7. Export CSV from dashboard.
8. Confirm analytics events are emitted when enabled.

## 6) GitHub Pages setup for client-facing project profile
1. Repository Settings → Pages.
2. Source: `Deploy from branch`.
3. Branch: `main` / folder: `/docs`.
4. Save and verify docs homepage renders.
