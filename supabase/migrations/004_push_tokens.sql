CREATE TABLE push_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  platform   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_tokens_all ON push_tokens
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Schedule resurfacing cron (requires pg_cron extension)
-- Run this after enabling pg_cron in your Supabase project extensions
SELECT cron.schedule(
  'resurfacing-daily',
  '0 8 * * *',
  $$ SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/resurfacing-cron',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
  ) $$
);
