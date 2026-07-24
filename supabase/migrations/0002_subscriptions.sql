-- IAmoviestory: subscriptions table (Stripe -> Supabase unlock)
-- Apply via Supabase Dashboard -> SQL Editor, or psql with DIRECT_URL.

create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  stripe_customer_id text,
  email              text,
  plan               text not null check (plan in ('monthly','quarterly','yearly')),
  status             text not null default 'active'
                      check (status in ('active','trialing','past_due','canceled','incomplete')),
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists subscriptions_cust_idx
  on public.subscriptions (stripe_customer_id);
create index if not exists subscriptions_email_idx
  on public.subscriptions (email);

alter table public.subscriptions enable row level security;

-- Service role (server) manages this table; the webhook writes rows.
-- No public client access: RLS denies anon/authenticated by default.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
