-- ── Content reports table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  moment_id    UUID REFERENCES moments(id) ON DELETE SET NULL,
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason       TEXT NOT NULL CHECK (reason IN ('inappropriate','harassment','spam','fake','other')),
  details      TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed','actioned')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Reporters can insert and view their own reports
CREATE POLICY "content_reports: insert own" ON content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "content_reports: select own" ON content_reports
  FOR SELECT USING (reporter_id = auth.uid());

-- ── Rate limiting via per-minute insert guards ────────────────────────────────
-- Moments: max 20 per hour per user
CREATE OR REPLACE FUNCTION check_moment_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM moments
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'rate_limit: too many moments (max 20 per hour)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS moment_rate_limit ON moments;
CREATE TRIGGER moment_rate_limit
  BEFORE INSERT ON moments
  FOR EACH ROW EXECUTE FUNCTION check_moment_rate_limit();

-- Messages: max 60 per minute per user
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM messages
  WHERE sender_id = NEW.sender_id
    AND sent_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'rate_limit: too many messages (max 60 per minute)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS message_rate_limit ON messages;
CREATE TRIGGER message_rate_limit
  BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION check_message_rate_limit();

-- Reports: max 10 per hour per user (prevent report-bombing)
CREATE OR REPLACE FUNCTION check_report_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM content_reports
  WHERE reporter_id = NEW.reporter_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'rate_limit: too many reports (max 10 per hour)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS report_rate_limit ON content_reports;
CREATE TRIGGER report_rate_limit
  BEFORE INSERT ON content_reports
  FOR EACH ROW EXECUTE FUNCTION check_report_rate_limit();

-- ── Storage quota: 5 GB per user (enforced via RLS + function) ───────────────
-- Supabase Storage doesn't support row-level quotas natively;
-- quota is enforced via the edge function on upload.
-- See supabase/functions/check-storage-quota/index.ts
