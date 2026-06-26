-- Error logs table for crash reporting (used by log-error edge function)
CREATE TABLE IF NOT EXISTS error_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message       TEXT NOT NULL,
  stack         TEXT,
  context       JSONB,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only service role can read; anon key can insert via the edge function
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access" ON error_logs
  USING (auth.role() = 'service_role');

-- Profile privacy columns (may already exist on some installs)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resurface_consent BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_visible  BOOLEAN NOT NULL DEFAULT true;

-- Track when each participant last read a conversation (for unread counts)
ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ;
