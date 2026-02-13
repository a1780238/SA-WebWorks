# AGENTS.md

## Scope
Applies to the entire repository.

## Build rules
- Use Next.js App Router + TypeScript.
- Keep tenant-specific business values in `config/tenant.ts`.
- Never expose service role keys client-side.
- API writes to Supabase must run server-side only.

## Delivery rules
- Keep README deployment steps current.
- Maintain Supabase migrations in `supabase/migrations`.
