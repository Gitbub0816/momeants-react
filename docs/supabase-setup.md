# Supabase Setup

## 1. Create project

Go to [app.supabase.com](https://app.supabase.com), create a new project.
Choose a region close to your users. Copy the **Project URL** and **anon public key**.

## 2. Run migrations

In the Supabase dashboard → SQL Editor, run the migrations in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_views_and_functions.sql
```

Or with the Supabase CLI:
```bash
supabase db push
```

## 3. Wire up the mobile app

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
```

Edit `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Storage buckets

The migration creates three buckets automatically:
- `moments` — full-size moment photos (private, signed URLs)
- `thumbnails` — auto-generated thumbnails (private)
- `avatars` — profile photos (public)

## 5. Deploy Edge Functions

```bash
supabase functions deploy resurfacing-cron
supabase functions deploy push-notifications
```

Schedule the resurfacing cron in the Supabase dashboard:
- Dashboard → Edge Functions → resurfacing-cron → Schedule
- Cron: `0 8 * * *` (8am UTC daily)

## 6. Push notification webhook

In Supabase dashboard → Database → Webhooks, create:
- Name: `on_notification_insert`
- Table: `notifications`  
- Events: `INSERT`
- URL: `https://your-project-id.supabase.co/functions/v1/push-notifications`

## 7. Switching from mock to real API

The `ApiContext.tsx` automatically uses the real `SupabaseMomentsApi` when
`EXPO_PUBLIC_SUPABASE_URL` is set, and falls back to `MockMomentsApi` otherwise.
No code changes needed — just set the env vars.
