-- IAmoviestory: comments table (open mode, auto-approve)
-- Apply via Supabase Dashboard → SQL Editor, or psql with DIRECT_URL.

create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  series_id    text not null,
  episode      integer not null,
  display_name text not null default 'Anonymous',
  body         text not null,
  status       text not null default 'approved'
                 check (status in ('pending', 'approved', 'hidden')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists comments_series_ep_idx
  on public.comments (series_id, episode, status, created_at);

-- RLS: public read of approved comments; public insert of approved comments.
-- (Login gate handled later by tightening these policies.)
alter table public.comments enable row level security;

drop policy if exists "public read approved" on public.comments;
create policy "public read approved"
  on public.comments for select
  using (status = 'approved');

drop policy if exists "public insert" on public.comments;
create policy "public insert"
  on public.comments for insert
  with check (status = 'approved');

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();
