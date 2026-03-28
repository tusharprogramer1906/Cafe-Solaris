create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  message text not null,
  source text,
  status text not null default 'new',
  conversion_value numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists status text not null default 'new';

alter table public.leads
  add column if not exists conversion_value numeric not null default 0;

alter table public.leads
  add column if not exists email text;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  message text not null,
  reply text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_name text not null,
  phone text not null,
  plan text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.clients enable row level security;

create policy "Authenticated users can read leads"
on public.leads for select
to authenticated
using (true);

create policy "Authenticated users can read conversations"
on public.conversations for select
to authenticated
using (true);

create policy "Authenticated users can read clients"
on public.clients for select
to authenticated
using (true);

