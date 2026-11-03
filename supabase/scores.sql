-- Run in Supabase SQL editor to enable the shared leaderboard.
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 24),
  total integer not null check (total >= 0 and total <= 1000),
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists scores_total_created_idx
  on public.scores (total desc, created_at asc);

alter table public.scores enable row level security;

create policy "Public read scores"
  on public.scores for select
  to anon, authenticated
  using (true);

create policy "Public insert scores"
  on public.scores for insert
  to anon, authenticated
  with check (
    char_length(display_name) between 2 and 24
    and total >= 0
    and total <= 1000
  );
