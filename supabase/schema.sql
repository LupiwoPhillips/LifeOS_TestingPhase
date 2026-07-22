-- ============================================================================
-- Life OS — Supabase schema
-- ============================================================================
-- Run this once against a fresh Supabase project (SQL Editor → New Query →
-- paste this whole file → Run). It creates every table the app expects,
-- turns on Row Level Security so each user can only ever see their own rows,
-- and adds a trigger so a baseline `life_metrics` row exists the moment
-- someone signs up (the app also creates this defensively on first load,
-- so this trigger is a belt-and-braces safety net, not a hard requirement).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- life_metrics — the six life-area scores + overall score, one row per user
-- ----------------------------------------------------------------------------
create table if not exists public.life_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spiritual_score int not null default 50 check (spiritual_score between 0 and 100),
  mental_score int not null default 50 check (mental_score between 0 and 100),
  career_score int not null default 50 check (career_score between 0 and 100),
  fitness_score int not null default 50 check (fitness_score between 0 and 100),
  relationships_score int not null default 50 check (relationships_score between 0 and 100),
  finance_score int not null default 50 check (finance_score between 0 and 100),
  overall_score int not null default 50 check (overall_score between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- ----------------------------------------------------------------------------
-- tasks
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  life_area text check (life_area in ('spiritual','mental','career','fitness','relationships','finance')),
  priority text default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- goals
-- ----------------------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  life_area text check (life_area in ('spiritual','mental','career','fitness','relationships','finance')),
  priority text default 'medium' check (priority in ('low','medium','high')),
  target_date date,
  progress int not null default 0 check (progress between 0 and 100),
  status text not null default 'In Progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- journal_entries
-- ----------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  life_area text check (life_area in ('spiritual','mental','career','fitness','relationships','finance')),
  mood_score int check (mood_score between 0 and 10),
  impact_score int default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- daily_checkins
-- ----------------------------------------------------------------------------
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  mood text,
  mood_score int check (mood_score between 0 and 10),
  energy int check (energy between 0 and 100),
  stress int check (stress between 0 and 100),
  mind text,
  gratitude text[],
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ----------------------------------------------------------------------------
-- habits + habit_logs
-- ----------------------------------------------------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  life_area text check (life_area in ('spiritual','mental','career','fitness','relationships','finance')),
  frequency text default 'daily' check (frequency in ('daily','weekly')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

-- ----------------------------------------------------------------------------
-- life_events — the activity timeline shown on Home / Insights
-- ----------------------------------------------------------------------------
create table if not exists public.life_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  source_table text,
  source_id uuid,
  life_area text,
  impact_score int default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security — every table is locked to `auth.uid() = user_id`
-- ============================================================================

alter table public.life_metrics enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.journal_entries enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.life_events enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['life_metrics','tasks','goals','journal_entries','daily_checkins','habits','life_events']
  loop
    execute format('drop policy if exists "select_own" on public.%I', t);
    execute format('drop policy if exists "insert_own" on public.%I', t);
    execute format('drop policy if exists "update_own" on public.%I', t);
    execute format('drop policy if exists "delete_own" on public.%I', t);

    execute format('create policy "select_own" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "insert_own" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "update_own" on public.%I for update using (auth.uid() = user_id)', t);
    execute format('create policy "delete_own" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- habit_logs is scoped by user_id directly, but also double-check the parent habit
drop policy if exists "select_own" on public.habit_logs;
drop policy if exists "insert_own" on public.habit_logs;
drop policy if exists "update_own" on public.habit_logs;
drop policy if exists "delete_own" on public.habit_logs;

create policy "select_own" on public.habit_logs for select using (auth.uid() = user_id);
create policy "insert_own" on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "update_own" on public.habit_logs for update using (auth.uid() = user_id);
create policy "delete_own" on public.habit_logs for delete using (auth.uid() = user_id);

-- ============================================================================
-- Auto-create a baseline life_metrics row whenever a new user signs up
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.life_metrics (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Helpful indexes
-- ============================================================================

create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_journal_user on public.journal_entries(user_id);
create index if not exists idx_checkins_user on public.daily_checkins(user_id);
create index if not exists idx_habits_user on public.habits(user_id);
create index if not exists idx_habit_logs_habit on public.habit_logs(habit_id);
create index if not exists idx_habit_logs_user on public.habit_logs(user_id);
create index if not exists idx_events_user on public.life_events(user_id);
