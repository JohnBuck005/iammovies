-- PayPal manual-payment claims
-- Stores pending payment proofs; admin approves by inserting into subscriptions.
create table if not exists public.paypal_claims (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  plan             text not null check (plan in ('monthly','quarterly','yearly')),
  payment_reference text not null,
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists paypal_claims_email_idx
  on public.subscriptions (email);

alter table public.paypal_claims enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists paypal_claims_set_updated_at on public.paypal_claims;
create trigger paypal_claims_set_updated_at
  before update on public.paypal_claims
  for each row execute function public.set_updated_at();

-- Allow server/service role full access; anon/authenticated can insert their own claim.
create policy "service_role_full_paypal_claims"
  on public.paypal_claims
  for all
  to service_role
  using (true);

create policy "anon_insert_paypal_claims"
  on public.paypal_claims
  for insert
  to anon, authenticated
  with check (true);
