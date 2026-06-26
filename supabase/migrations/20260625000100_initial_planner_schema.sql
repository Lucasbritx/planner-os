create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  week_starts_on smallint not null default 0 check (week_starts_on between 0 and 6),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.weeks (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  title text not null,
  status text not null default 'planned' check (status in ('planned', 'active', 'reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weeks_valid_range check (end_date = start_date + 6),
  constraint weeks_sunday_start check (extract(dow from start_date) = 0),
  constraint weeks_user_start_unique unique (user_id, start_date),
  constraint weeks_id_user_unique unique (id, user_id)
);

create table public.weekly_goals (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_id uuid not null,
  title text not null,
  category text not null check (category in ('work', 'study', 'fitness', 'reading', 'poc', 'personal')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'skipped')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_goals_week_owner_fk foreign key (week_id, user_id)
    references public.weeks(id, user_id) on delete cascade
);

create table public.timeboxes (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_id uuid not null,
  title text not null,
  category text not null check (category in ('work', 'study', 'fitness', 'reading', 'poc', 'personal', 'recovery')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  status text not null default 'planned' check (status in ('planned', 'done', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timeboxes_valid_range check (ends_at > starts_at),
  constraint timeboxes_week_owner_fk foreign key (week_id, user_id)
    references public.weeks(id, user_id) on delete cascade
);

create table public.study_items (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_id uuid,
  title text not null,
  topic text not null,
  type text not null check (type in ('article', 'course', 'video', 'documentation', 'practice')),
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  completed_minutes integer not null default 0 check (completed_minutes >= 0),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'skipped')),
  checklist jsonb not null default '[]'::jsonb check (jsonb_typeof(checklist) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_items_minutes_progress check (completed_minutes <= estimated_minutes),
  constraint study_items_week_owner_fk foreign key (week_id, user_id)
    references public.weeks(id, user_id) on delete cascade
);

create table public.books (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  author text not null,
  total_pages integer not null check (total_pages > 0),
  current_page integer not null default 0 check (current_page >= 0),
  weekly_target_pages integer not null default 0 check (weekly_target_pages >= 0),
  status text not null default 'reading' check (status in ('reading', 'paused', 'finished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_page_progress check (current_page <= total_pages),
  constraint books_id_user_unique unique (id, user_id)
);

create table public.reading_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null,
  week_id uuid,
  read_date date not null default current_date,
  pages_read integer not null check (pages_read > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_logs_book_owner_fk foreign key (book_id, user_id)
    references public.books(id, user_id) on delete cascade,
  constraint reading_logs_week_owner_fk foreign key (week_id, user_id)
    references public.weeks(id, user_id) on delete cascade
);

create table public.pocs (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  goal text not null default '',
  repo_url text,
  stack text[] not null default '{}',
  status text not null default 'idea' check (status in ('idea', 'doing', 'paused', 'done')),
  scope_checklist jsonb not null default '[]'::jsonb check (jsonb_typeof(scope_checklist) = 'array'),
  ai_evaluation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_id uuid not null,
  type text not null check (type in ('run', 'strength', 'mobility', 'pilates', 'football', 'rest')),
  planned_date date not null,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  distance_km numeric(6,2) check (distance_km is null or distance_km >= 0),
  intensity text not null default 'easy' check (intensity in ('easy', 'moderate', 'hard')),
  status text not null default 'planned' check (status in ('planned', 'done', 'skipped')),
  notes text,
  source text not null default 'manual' check (source in ('manual', 'garmin', 'suggested')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workouts_week_owner_fk foreign key (week_id, user_id)
    references public.weeks(id, user_id) on delete cascade
);

create table public.weekly_reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_id uuid not null,
  wins text not null default '',
  misses text not null default '',
  learnings text not null default '',
  next_week_focus text not null default '',
  score_study smallint check (score_study between 1 and 10),
  score_fitness smallint check (score_fitness between 1 and 10),
  score_work smallint check (score_work between 1 and 10),
  score_personal smallint check (score_personal between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_reviews_week_unique unique (week_id),
  constraint weekly_reviews_week_owner_fk foreign key (week_id, user_id)
    references public.weeks(id, user_id) on delete cascade
);

create index profiles_email_idx on public.profiles(email);
create index weeks_user_status_idx on public.weeks(user_id, status);
create index weeks_user_dates_idx on public.weeks(user_id, start_date, end_date);
create index weekly_goals_user_week_idx on public.weekly_goals(user_id, week_id);
create index weekly_goals_user_status_idx on public.weekly_goals(user_id, status);
create index timeboxes_user_week_idx on public.timeboxes(user_id, week_id);
create index timeboxes_user_starts_at_idx on public.timeboxes(user_id, starts_at);
create index study_items_user_week_idx on public.study_items(user_id, week_id);
create index study_items_user_status_idx on public.study_items(user_id, status);
create index books_user_status_idx on public.books(user_id, status);
create index reading_logs_user_book_idx on public.reading_logs(user_id, book_id);
create index reading_logs_user_week_idx on public.reading_logs(user_id, week_id);
create index pocs_user_status_idx on public.pocs(user_id, status);
create index workouts_user_week_idx on public.workouts(user_id, week_id);
create index workouts_user_date_idx on public.workouts(user_id, planned_date);
create index workouts_user_status_idx on public.workouts(user_id, status);
create index weekly_reviews_user_week_idx on public.weekly_reviews(user_id, week_id);

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_weeks_updated_at before update on public.weeks
  for each row execute function public.set_updated_at();
create trigger set_weekly_goals_updated_at before update on public.weekly_goals
  for each row execute function public.set_updated_at();
create trigger set_timeboxes_updated_at before update on public.timeboxes
  for each row execute function public.set_updated_at();
create trigger set_study_items_updated_at before update on public.study_items
  for each row execute function public.set_updated_at();
create trigger set_books_updated_at before update on public.books
  for each row execute function public.set_updated_at();
create trigger set_reading_logs_updated_at before update on public.reading_logs
  for each row execute function public.set_updated_at();
create trigger set_pocs_updated_at before update on public.pocs
  for each row execute function public.set_updated_at();
create trigger set_workouts_updated_at before update on public.workouts
  for each row execute function public.set_updated_at();
create trigger set_weekly_reviews_updated_at before update on public.weekly_reviews
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  local_today date;
  week_start date;
  display_name text;
  user_email text;
begin
  local_today := (now() at time zone 'America/Sao_Paulo')::date;
  week_start := local_today - extract(dow from local_today)::integer;
  display_name := coalesce(
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1),
    ''
  );
  user_email := coalesce(new.email, '');

  insert into public.profiles (id, name, email)
  values (new.id, display_name, user_email)
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    updated_at = now();

  insert into public.weeks (user_id, start_date, end_date, title, status)
  values (
    new.id,
    week_start,
    week_start + 6,
    'Semana de ' || to_char(week_start, 'DD/MM'),
    'active'
  )
  on conflict (user_id, start_date) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.weeks enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.timeboxes enable row level security;
alter table public.study_items enable row level security;
alter table public.books enable row level security;
alter table public.reading_logs enable row level security;
alter table public.pocs enable row level security;
alter table public.workouts enable row level security;
alter table public.weekly_reviews enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.weeks,
  public.weekly_goals,
  public.timeboxes,
  public.study_items,
  public.books,
  public.reading_logs,
  public.pocs,
  public.workouts,
  public.weekly_reviews
to authenticated;
grant select, update on public.profiles to authenticated;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "weeks_own_rows" on public.weeks
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "weekly_goals_own_rows" on public.weekly_goals
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "timeboxes_own_rows" on public.timeboxes
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "study_items_own_rows" on public.study_items
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "books_own_rows" on public.books
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "reading_logs_own_rows" on public.reading_logs
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "pocs_own_rows" on public.pocs
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "workouts_own_rows" on public.workouts
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "weekly_reviews_own_rows" on public.weekly_reviews
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.handle_new_user() from public;
