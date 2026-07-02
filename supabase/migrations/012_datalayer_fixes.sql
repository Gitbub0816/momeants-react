-- ============================================================================
-- Migration 012: Data-layer bug fixes
--   1. Fix moment-creation rate-limit trigger (wrong column name broke ALL
--      moment inserts).
--   2. Add 'public' visibility to moments + profiles and enforce it in RLS.
--   3. Make the 'moments' storage bucket public so getPublicUrl() images load,
--      and (re)create idempotent storage policies.
--   4. Add a circle_members UPDATE policy + conversations UPDATE policy so
--      upserts / updated_at touches aren't silently blocked by RLS.
-- Safe to paste into the Supabase SQL editor. Idempotent where possible.
-- ============================================================================

-- ── 1. FIX MOMENT RATE-LIMIT TRIGGER ────────────────────────────────────────
-- moments has column `author_id`, not `user_id`. The old function referenced
-- NEW.user_id which raised "record NEW has no field user_id" on every insert,
-- so no moment could ever be created.
CREATE OR REPLACE FUNCTION check_moment_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM moments
  WHERE author_id = NEW.author_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'rate_limit: too many moments (max 20 per hour)';
  END IF;
  RETURN NEW;
END;
$$;

-- ── 2. PUBLIC VISIBILITY ────────────────────────────────────────────────────
-- Widen the CHECK constraints on moments.visibility and profiles.default_privacy.
ALTER TABLE moments DROP CONSTRAINT IF EXISTS moments_visibility_check;
ALTER TABLE moments ADD CONSTRAINT moments_visibility_check
  CHECK (visibility IN ('private','close_circle','selected_people','public'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_default_privacy_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_default_privacy_check
  CHECK (default_privacy IN ('private','close_circle','selected_people','public'));

-- Teach the visibility helper about 'public': any authenticated viewer can see
-- a public moment. moments_select already uses can_view_moment(), so updating
-- the function is enough to expose public moments through RLS.
CREATE OR REPLACE FUNCTION can_view_moment(m moments)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT CASE m.visibility
    WHEN 'private' THEN m.author_id = auth.uid()
    WHEN 'close_circle' THEN
      m.author_id = auth.uid() OR viewer_in_circle(m.author_id)
    WHEN 'selected_people' THEN
      m.author_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM moment_access
        WHERE moment_id = m.id AND profile_id = auth.uid()
      )
    WHEN 'public' THEN auth.uid() IS NOT NULL
    ELSE FALSE
  END;
$$;

-- Include public moments in the home feed for every authenticated viewer.
CREATE OR REPLACE FUNCTION get_home_feed(viewer UUID, lim INT DEFAULT 20)
RETURNS SETOF moment_detail
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT md.* FROM moment_detail md
  JOIN moments m ON m.id = md.id
  WHERE
    m.author_id = viewer
    OR (m.visibility = 'close_circle' AND viewer_in_circle(m.author_id))
    OR (m.visibility = 'selected_people' AND EXISTS (
      SELECT 1 FROM moment_access ma
      WHERE ma.moment_id = m.id AND ma.profile_id = viewer
    ))
    OR m.visibility = 'public'
  ORDER BY m.created_at DESC
  LIMIT lim;
$$;

-- ── 3. STORAGE: make 'moments' bucket public + idempotent policies ──────────
-- getPublicUrl() only returns a working URL for a public bucket. The bucket was
-- created private in 003, so uploaded moment images 403'd for everyone.
INSERT INTO storage.buckets (id, name, public)
  VALUES ('moments','moments', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS moments_upload ON storage.objects;
CREATE POLICY moments_upload ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'moments'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS moments_read ON storage.objects;
CREATE POLICY moments_read ON storage.objects FOR SELECT
  USING (bucket_id IN ('moments','thumbnails','avatars'));

-- ── 4. RLS: allow the writes the API actually performs ──────────────────────
-- circle_members: an ON CONFLICT DO UPDATE upsert needs an UPDATE policy. The
-- API now uses DO NOTHING, but add the policy so either form works.
DROP POLICY IF EXISTS circle_update ON circle_members;
CREATE POLICY circle_update ON circle_members FOR UPDATE
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- conversations: participants must be able to touch updated_at (message send
-- bumps conversation ordering).
DROP POLICY IF EXISTS "conversations: update if participant" ON conversations;
CREATE POLICY "conversations: update if participant" ON conversations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM conversation_participants
            WHERE conversation_id = id AND user_id = auth.uid())
  );
