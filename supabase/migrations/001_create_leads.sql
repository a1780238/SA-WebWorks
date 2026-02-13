create extension if not exists "pgcrypto";

do $$ begin
  create type urgency_type as enum ('emergency','today','this_week','quote');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new','contacted','booked','won','lost','deposit_paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_window as enum ('morning','afternoon','evening');
exception when duplicate_object then null; end $$;

do $$ begin
  create type deposit_status_type as enum ('none','pending','paid');
exception when duplicate_object then null; end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tenant_key text not null,
  name text not null,
  phone text not null,
  email text,
  suburb text not null,
  job_type text not null,
  urgency urgency_type not null,
  description text,
  preferred_contact_window contact_window,
  source text not null default 'unknown',
  page_source text not null default 'unknown',
  status lead_status not null default 'new',
  notes text,
  deposit_status deposit_status_type not null default 'none',
  deposit_amount_cents int not null default 0,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text
);

create table if not exists public.notification_attempts (
  unique_key text primary key,
  lead_id uuid references public.leads(id) on delete cascade,
  channel text not null,
  recipient text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tenant_key text not null,
  lead_id uuid references public.leads(id) on delete set null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.webhook_events (
  provider text not null,
  event_id text not null,
  created_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  primary key (provider, event_id)
);

alter table public.leads enable row level security;

create policy "admin read own tenant leads"
on public.leads for select
to authenticated
using (tenant_key = coalesce(auth.jwt()->>'tenant_key', ''));

create policy "admin update own tenant leads"
on public.leads for update
to authenticated
using (tenant_key = coalesce(auth.jwt()->>'tenant_key', ''))
with check (tenant_key = coalesce(auth.jwt()->>'tenant_key', ''));
