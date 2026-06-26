begin;

create extension if not exists pgtap with schema extensions;

select plan(23);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'weeks', 'weeks table exists');
select has_table('public', 'weekly_goals', 'weekly goals table exists');
select has_table('public', 'timeboxes', 'timeboxes table exists');
select has_table('public', 'study_items', 'study items table exists');
select has_table('public', 'books', 'books table exists');
select has_table('public', 'reading_logs', 'reading logs table exists');
select has_table('public', 'pocs', 'pocs table exists');
select has_table('public', 'workouts', 'workouts table exists');
select has_table('public', 'weekly_reviews', 'weekly reviews table exists');

select lives_ok(
  $$insert into auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values (
    '00000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'owner@example.com',
    'not-real',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Owner User"}'::jsonb,
    now(),
    now()
  )$$,
  'auth user insert bootstraps profile and week'
);

select is(
  (select name from public.profiles where id = '00000000-0000-4000-8000-000000000001'),
  'Owner User',
  'profile name comes from auth metadata'
);

select is(
  (select count(*)::integer from public.weeks where user_id = '00000000-0000-4000-8000-000000000001' and status = 'active'),
  1,
  'new user receives one active current week'
);

select is(
  (select extract(dow from start_date)::integer from public.weeks where user_id = '00000000-0000-4000-8000-000000000001'),
  0,
  'bootstrapped current week starts on Sunday'
);

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '00000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'second@example.com',
    'not-real',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Second User"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'third@example.com',
    'not-real',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Third User"}'::jsonb,
    now(),
    now()
  );

update public.weeks
set id = '10000000-0000-4000-8000-000000000001',
    title = 'Second week'
where user_id = '00000000-0000-4000-8000-000000000002';

update public.weeks
set id = '10000000-0000-4000-8000-000000000002',
    title = 'Third week'
where user_id = '00000000-0000-4000-8000-000000000003';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);

select is(
  (select count(*)::integer from public.weeks),
  1,
  'RLS only exposes weeks owned by the current user'
);

select lives_ok(
  $$insert into public.weekly_goals (user_id, week_id, title, category, priority)
    values ('00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Ship MVP', 'work', 'high')$$,
  'authenticated user can insert own weekly goal'
);

select throws_ok(
  $$insert into public.weekly_goals (user_id, week_id, title, category, priority)
    values ('00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Read private data', 'work', 'high')$$,
  'authenticated user cannot insert rows for another user'
);

reset role;

select throws_ok(
  $$insert into public.weeks (user_id, start_date, end_date, title)
    values ('00000000-0000-4000-8000-000000000002', date '2026-06-22', date '2026-06-28', 'Bad week')$$,
  'weeks must start on Sunday'
);

select throws_ok(
  $$insert into public.books (user_id, title, author, total_pages, current_page)
    values ('00000000-0000-4000-8000-000000000002', 'Too far', 'Author', 100, 101)$$,
  'book current page cannot exceed total pages'
);

select throws_ok(
  $$insert into public.workouts (user_id, week_id, type, planned_date, duration_minutes, intensity)
    values ('00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'run', date '2026-06-23', -1, 'easy')$$,
  'workout duration cannot be negative'
);

select throws_ok(
  $$insert into public.weekly_reviews (user_id, week_id, score_study)
    values ('00000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 11)$$,
  'weekly review scores are limited to 1 through 10'
);

select lives_ok(
  $$insert into public.pocs (user_id, title, scope_checklist)
    values ('00000000-0000-4000-8000-000000000002', 'Garmin sync spike', '[{"title":"Map activity payload","done":false}]'::jsonb)$$,
  'POC scope checklist accepts JSON arrays'
);

select throws_ok(
  $$insert into public.pocs (user_id, title, scope_checklist)
    values ('00000000-0000-4000-8000-000000000002', 'Broken POC', '{"title":"not an array"}'::jsonb)$$,
  'POC scope checklist rejects non-arrays'
);

select * from finish();

rollback;
