-- CyberOps Suite Supabase/PostgreSQL schema.
-- Run this in the Supabase SQL editor for free-tier PostgreSQL persistence.
-- The app backend owns authentication and uses server-side credentials only.

create extension if not exists pgcrypto;

do $$
begin
  create type public.cyberops_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.cyberops_status as enum ('active', 'disabled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null unique,
  role public.cyberops_role not null default 'user',
  status public.cyberops_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx
  on public.profiles (lower(email));

create table if not exists public.auth_credentials (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  password_hash text not null,
  password_salt text not null,
  password_params text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  user_agent text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists auth_sessions_user_id_idx
  on public.auth_sessions (user_id);

create index if not exists auth_sessions_token_hash_idx
  on public.auth_sessions (token_hash);

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scan_type text not null check (scan_type in ('url-analysis')),
  target text,
  risk_level text check (risk_level in ('Low', 'Medium', 'High')),
  score integer check (score between 0 and 100),
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists scan_history_user_created_idx
  on public.scan_history (user_id, created_at desc);

create table if not exists public.password_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  strength_label text not null check (strength_label in ('Very weak', 'Weak', 'Fair', 'Strong', 'Excellent')),
  password_length integer not null check (password_length between 1 and 128),
  entropy numeric(8, 2) not null,
  warning_count integer not null check (warning_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists password_audits_user_created_idx
  on public.password_audits (user_id, created_at desc);

create table if not exists public.app_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.auth_credentials enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.scan_history enable row level security;
alter table public.password_audits enable row level security;
alter table public.app_preferences enable row level security;

-- No public table policies are created intentionally.
-- The application backend uses server-side credentials and enforces authentication,
-- role checks, and user_id filtering before issuing database operations.
-- Do not expose service-role keys to the browser.

-- Initial admin setup:
-- 1. Create the first admin through the local CLI script documented in README.
-- 2. Or, after registering a normal account, promote it manually in Supabase SQL:
--    update public.profiles set role = 'admin', updated_at = now()
--    where email = 'admin@example.edu';
-- Never expose admin-role assignment through a public registration form.
