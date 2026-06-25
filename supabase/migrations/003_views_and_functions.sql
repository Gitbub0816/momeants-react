-- ─── MOMENT DETAIL VIEW ──────────────────────────────────────────────────────
-- Assembles a moment with all its related data in one query
CREATE OR REPLACE VIEW moment_detail AS
SELECT
  m.id,
  m.author_id,
  m.image_url,
  m.thumbnail_url,
  m.caption,
  m.visibility,
  m.created_at,
  m.updated_at,
  -- Author profile
  p.display_name   AS author_name,
  p.username       AS author_username,
  p.avatar_url     AS author_avatar_url,
  -- Moods as ordered array
  COALESCE(
    (SELECT jsonb_agg(mm.mood ORDER BY mm.sort_order)
     FROM moment_moods mm WHERE mm.moment_id = m.id),
    '[]'::jsonb
  ) AS moods,
  -- People as array
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object(
       'name', mp.name_label,
       'profileId', mp.profile_id
     ))
     FROM moment_people mp WHERE mp.moment_id = m.id),
    '[]'::jsonb
  ) AS people,
  -- Location
  to_jsonb(ml.*) - 'moment_id' AS location,
  -- Reaction counts grouped by emoji
  COALESCE(
    (SELECT jsonb_object_agg(emoji, cnt)
     FROM (
       SELECT emoji, COUNT(*) AS cnt
       FROM reactions r WHERE r.moment_id = m.id
       GROUP BY emoji
     ) rc),
    '{}'::jsonb
  ) AS reaction_counts
FROM moments m
JOIN profiles p ON p.id = m.author_id
LEFT JOIN moment_locations ml ON ml.moment_id = m.id;

-- ─── HOME FEED FUNCTION ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_home_feed(viewer UUID, lim INT DEFAULT 20)
RETURNS SETOF moment_detail
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT md.* FROM moment_detail md
  JOIN moments m ON m.id = md.id
  WHERE
    -- Own moments
    m.author_id = viewer
    -- Circle moments
    OR (m.visibility = 'close_circle' AND viewer_in_circle(m.author_id))
    -- Selected-people moments
    OR (m.visibility = 'selected_people' AND EXISTS (
      SELECT 1 FROM moment_access ma
      WHERE ma.moment_id = m.id AND ma.profile_id = viewer
    ))
  ORDER BY m.created_at DESC
  LIMIT lim;
$$;

-- ─── TIMELINE FUNCTION ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_timeline(
  viewer    UUID,
  yr        INT DEFAULT NULL,
  mo        INT DEFAULT NULL
)
RETURNS SETOF moment_detail
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT md.* FROM moment_detail md
  JOIN moments m ON m.id = md.id
  WHERE m.author_id = viewer
    AND (yr IS NULL OR EXTRACT(year  FROM m.created_at) = yr)
    AND (mo IS NULL OR EXTRACT(month FROM m.created_at) = mo)
  ORDER BY m.created_at DESC;
$$;

-- ─── RESURFACING FUNCTION ────────────────────────────────────────────────────
-- Returns moments from the same calendar day in prior years
CREATE OR REPLACE FUNCTION get_resurfaced_moments(viewer UUID)
RETURNS SETOF moment_detail
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT md.* FROM moment_detail md
  JOIN moments m ON m.id = md.id
  LEFT JOIN resurfacing_rules rr ON rr.user_id = viewer
  WHERE
    m.author_id = viewer
    -- Same month + day, but not this year
    AND EXTRACT(month FROM m.created_at) = EXTRACT(month FROM NOW())
    AND EXTRACT(day   FROM m.created_at) = EXTRACT(day   FROM NOW())
    AND EXTRACT(year  FROM m.created_at) < EXTRACT(year  FROM NOW())
    -- Respect hidden people
    AND NOT EXISTS (
      SELECT 1 FROM moment_people mp
      WHERE mp.moment_id = m.id
        AND mp.profile_id = ANY(COALESCE(rr.hide_people_ids, '{}'))
    )
    -- Respect hidden places
    AND NOT EXISTS (
      SELECT 1 FROM moment_locations ml
      WHERE ml.moment_id = m.id
        AND ml.label = ANY(COALESCE(rr.hide_place_labels, '{}'))
    )
  ORDER BY RANDOM()
  LIMIT 3;
$$;

-- ─── USERNAME AVAILABILITY ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION username_available(uname TEXT)
RETURNS BOOLEAN LANGUAGE sql AS $$
  SELECT NOT EXISTS (SELECT 1 FROM profiles WHERE username = uname);
$$;

-- ─── REACTION TOGGLE ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION toggle_reaction(
  p_moment_id UUID,
  p_emoji     TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reactions
    WHERE moment_id = p_moment_id AND user_id = auth.uid() AND emoji = p_emoji
  ) THEN
    DELETE FROM reactions
    WHERE moment_id = p_moment_id AND user_id = auth.uid() AND emoji = p_emoji;
  ELSE
    INSERT INTO reactions (moment_id, user_id, emoji)
    VALUES (p_moment_id, auth.uid(), p_emoji);
  END IF;
END;
$$;

-- ─── STORAGE BUCKETS ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('moments',   'moments',   false),
  ('avatars',   'avatars',   true),
  ('thumbnails','thumbnails', false)
ON CONFLICT DO NOTHING;

-- Storage RLS
CREATE POLICY moments_upload ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'moments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY moments_read ON storage.objects FOR SELECT
  USING (bucket_id IN ('moments','thumbnails','avatars') AND auth.role() = 'authenticated');

CREATE POLICY avatars_upload ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY avatars_update ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
