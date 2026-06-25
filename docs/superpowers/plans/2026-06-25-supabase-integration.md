# Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase Auth, SSR sessions, RLS-protected persistence, and an empty current week for every new Weekly OS user.

**Architecture:** Supabase SSR clients isolate browser and server concerns. Route Handlers own authentication and planner mutations, while a typed repository maps database rows to the existing domain model. PostgreSQL migrations define ownership, constraints, indexes, bootstrap triggers, and RLS.

**Tech Stack:** Next.js 16 App Router, TypeScript, `@supabase/supabase-js`, `@supabase/ssr`, PostgreSQL, Supabase Auth, Vitest.

---

### Task 1: Add Supabase dependencies and environment contract

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `src/lib/supabase/env.ts`
- Test: `src/lib/supabase/env.test.ts`

- [ ] Write a failing test proving missing URL/key produces a clear configuration error.
- [ ] Run `npm test -- src/lib/supabase/env.test.ts` and confirm failure because the module is missing.
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`.
- [ ] Implement `getSupabaseEnv()` returning the two public variables.
- [ ] Add `.env.example` containing only variable names.
- [ ] Run focused test, typecheck and lint.
- [ ] Commit `chore: add Supabase client dependencies`.

### Task 2: Create reproducible schema, RLS, and bootstrap

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/20260625000100_initial_planner_schema.sql`
- Create: `supabase/tests/rls_and_constraints.sql`

- [ ] Define `profiles`, `weeks`, `weekly_goals`, `timeboxes`, `study_items`, `books`, `reading_logs`, `pocs`, `workouts`, and `weekly_reviews`.
- [ ] Add UUID defaults, timestamps, enum-like checks, numeric checks, time checks, foreign keys, cascades, and ownership integrity.
- [ ] Add indexes for `user_id`, `week_id`, dates, and statuses used by the app.
- [ ] Add `set_updated_at()` trigger.
- [ ] Add a hardened `handle_new_user()` trigger with fixed `search_path`, profile defaults, and empty Sunday-based current week.
- [ ] Enable RLS on every public table and add ownership policies using `(select auth.uid())`.
- [ ] Add pgTAP coverage for ownership isolation, constraints, and bootstrap.
- [ ] Validate SQL syntax with the Supabase CLI when available; otherwise parse/review the migration and document the external apply command.
- [ ] Commit `feat: add Supabase schema and RLS`.

### Task 3: Implement SSR clients and route protection

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `proxy.ts`
- Create: `src/lib/auth/redirect.ts`
- Test: `src/lib/auth/redirect.test.ts`

- [ ] Write failing tests proving only relative redirect paths are accepted.
- [ ] Implement browser/server clients using the publishable key and cookie adapters.
- [ ] Implement proxy token refresh with `auth.getClaims()`.
- [ ] Protect planner routes and redirect authenticated users away from `/login` and `/signup`.
- [ ] Keep callback and static assets public.
- [ ] Run tests, typecheck, lint and build.
- [ ] Commit `feat: add Supabase SSR session handling`.

### Task 4: Add email/password and Google authentication

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/components/auth/auth-form.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/signout/route.ts`
- Create: `src/app/auth/auth-code-error/page.tsx`
- Test: `src/components/auth/auth-form.test.tsx`

- [ ] Write failing component tests for password login, signup, Google OAuth, loading, and errors.
- [ ] Implement accessible auth forms with password confirmation on signup.
- [ ] Use `signInWithPassword`, `signUp`, and `signInWithOAuth`.
- [ ] Google OAuth requests only profile/email and redirects through PKCE callback.
- [ ] Callback exchanges the code and rejects unsafe `next` values.
- [ ] Signout invalidates the session and redirects to login.
- [ ] Run tests, typecheck, lint and build.
- [ ] Commit `feat: add Supabase authentication flows`.

### Task 5: Add database types, mapping, and repository

**Files:**
- Create: `src/lib/supabase/database.types.ts`
- Create: `src/lib/planner/mappers.ts`
- Create: `src/lib/planner/mappers.test.ts`
- Create: `src/lib/planner/supabase-repository.ts`
- Create: `src/lib/planner/supabase-repository.test.ts`

- [ ] Write failing tests for snake_case ↔ camelCase mapping and error normalization.
- [ ] Define database types matching the migration.
- [ ] Implement row mappers for every entity.
- [ ] Implement `load`, `create`, `update`, `remove`, `updatePreferences`, and idempotent `ensureCurrentWeek`.
- [ ] Ensure all mutations rely on authenticated RLS and never accept arbitrary `user_id` from UI data.
- [ ] Run focused tests, typecheck and lint.
- [ ] Commit `feat: add Supabase planner repository`.

### Task 6: Connect the authenticated app to persistence

**Files:**
- Modify: `src/lib/store.tsx`
- Modify: `src/components/planner-app.tsx`
- Modify: planner page files under `src/app/*/page.tsx`
- Create: `src/app/(planner)/layout.tsx`
- Create: `src/components/planner/planner-provider.tsx`
- Create: `src/components/planner/planner-error.tsx`
- Test: `src/components/planner/planner-provider.test.tsx`

- [ ] Write failing tests for initial snapshot, successful mutation, rollback/error, and reload persistence contract.
- [ ] Load the authenticated snapshot in the private layout.
- [ ] Initialize the provider with server data instead of mocks.
- [ ] Route all mutations through the Supabase repository/Route Handlers.
- [ ] Show loading, saving, retry, empty-week, and error states.
- [ ] Display authenticated name/email and a logout action.
- [ ] Keep mocks only as an explicit development fallback, disabled when Supabase variables exist.
- [ ] Run tests, typecheck, lint and build.
- [ ] Commit `feat: persist planner data with Supabase`.

### Task 7: Configure the real project and verify

**Files:**
- Create local-only: `.env.local`
- Modify: `README.md`
- Modify: `PROJECT_TRACKER.md`

- [ ] Write the provided project URL and publishable key to `.env.local`.
- [ ] Link/apply migrations to project `ngiymudusqrfsumqxoji` using a user-authorized Supabase CLI session; if remote credentials are unavailable, provide the exact Dashboard SQL/CLI step and stop before claiming the database is applied.
- [ ] Document disabling email confirmation and configuring Google Client ID/Secret and callback URLs.
- [ ] Update the tracker accurately.
- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Verify unauthenticated redirect, email signup/login/logout, persistence after reload, and Google OAuth after external provider setup.
- [ ] Commit `docs: document Supabase setup and verification`.

### Task 8: Publish the integration branch

- [ ] Review the full diff against the design spec.
- [ ] Confirm no secret or `.env.local` is tracked.
- [ ] Push `codex/supabase-integration`.
- [ ] Merge to `main` only after all automated checks pass and external Supabase configuration is either verified or explicitly documented as pending.
