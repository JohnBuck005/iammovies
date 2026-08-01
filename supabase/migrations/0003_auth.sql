-- IAmoviestory: auth-backed user tables (real login + profiles + sync)
-- Apply in Supabase Dashboard -> SQL Editor, or psql with a DB connection string.
-- Safe to re-run (uses if-not-exists + drop-policy-if-exists).

-- 1) Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now()
);

-- 2) Watchlist (per user, per series)
create table if not exists public.watchlists (
  user_id    uuid references auth.users(id) on delete cascade,
  series_id  text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, series_id)
);

-- 3) Watch progress (per user, per series episode)
create table if not exists public.watch_progress (
  user_id    uuid references auth.users(id) on delete cascade,
  series_id  text not null,
  episode    integer not null,
  progress   integer not null default 0 check (progress between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, series_id, episode)
);

create index if not exists watch_progress_user_idx on public.watch_progress (user_id);

-- Row Level Security
alter table public.profiles      enable row level security;
alter table public.watchlists    enable row level security;
alter table public.watch_progress enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Watchlist policies (owner only, all commands)
drop policy if exists "watchlists_self" on public.watchlists;
create policy "watchlists_self" on public.watchlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Watch progress policies (owner only, all commands)
drop policy if exists "progress_self" on public.watch_progress;
create policy "progress_self" on public.watch_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(coalesce(new.email, ''), '@', 1))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
