-- Ranking compartido. Corré este archivo entero en el SQL Editor de Supabase.
-- Se puede volver a ejecutar: las policies se recrean.
--
-- Si ves 401 / "permission denied for table scores", re-ejecutá este script:
-- suele faltar el GRANT a anon/authenticated.

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

grant usage on schema public to anon, authenticated;
grant select, insert on table public.scores to anon, authenticated;

drop policy if exists "Public read scores" on public.scores;
create policy "Public read scores"
  on public.scores for select
  to anon, authenticated
  using (true);

drop policy if exists "Public insert scores" on public.scores;
create policy "Public insert scores"
  on public.scores for insert
  to anon, authenticated
  with check (
    char_length(display_name) between 2 and 24
    and total >= 0
    and total <= 1000
  );
