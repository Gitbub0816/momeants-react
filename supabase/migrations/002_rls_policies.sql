-- ─── ENABLE RLS ──────────────────────────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_moods    ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_people   ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_access   ENABLE ROW LEVEL SECURITY;
ALTER TABLE resurfacing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;

-- Helper: is the viewer in the author's close circle?
CREATE OR REPLACE FUNCTION viewer_in_circle(author UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM circle_members
    WHERE owner_id = author AND member_id = auth.uid()
  );
$$;

-- Helper: can the viewer see this moment?
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
    ELSE FALSE
  END;
$$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_delete ON profiles FOR DELETE USING (id = auth.uid());

-- ─── MOMENTS ─────────────────────────────────────────────────────────────────
CREATE POLICY moments_select ON moments FOR SELECT
  USING (can_view_moment(moments.*));

CREATE POLICY moments_insert ON moments FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY moments_update ON moments FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY moments_delete ON moments FOR DELETE
  USING (author_id = auth.uid());

-- ─── MOMENT MOODS (inherits moment visibility) ───────────────────────────────
CREATE POLICY moment_moods_select ON moment_moods FOR SELECT
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND can_view_moment(m.*)));
CREATE POLICY moment_moods_insert ON moment_moods FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND m.author_id = auth.uid()));
CREATE POLICY moment_moods_delete ON moment_moods FOR DELETE
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND m.author_id = auth.uid()));

-- ─── MOMENT PEOPLE ───────────────────────────────────────────────────────────
CREATE POLICY moment_people_select ON moment_people FOR SELECT
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND can_view_moment(m.*)));
CREATE POLICY moment_people_insert ON moment_people FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND m.author_id = auth.uid()));

-- ─── MOMENT LOCATIONS ────────────────────────────────────────────────────────
CREATE POLICY moment_locations_select ON moment_locations FOR SELECT
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND can_view_moment(m.*)));
CREATE POLICY moment_locations_insert ON moment_locations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND m.author_id = auth.uid()));

-- ─── CIRCLE MEMBERS ──────────────────────────────────────────────────────────
CREATE POLICY circle_select ON circle_members FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY circle_insert ON circle_members FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY circle_delete ON circle_members FOR DELETE USING (owner_id = auth.uid());

-- ─── REACTIONS ───────────────────────────────────────────────────────────────
CREATE POLICY reactions_select ON reactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND can_view_moment(m.*)));
CREATE POLICY reactions_insert ON reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY reactions_delete ON reactions FOR DELETE USING (user_id = auth.uid());

-- ─── COMMENTS ────────────────────────────────────────────────────────────────
CREATE POLICY comments_select ON comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND can_view_moment(m.*)));
CREATE POLICY comments_insert ON comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY comments_delete ON comments FOR DELETE USING (author_id = auth.uid());

-- ─── MOMENT ACCESS ───────────────────────────────────────────────────────────
CREATE POLICY moment_access_select ON moment_access FOR SELECT
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND m.author_id = auth.uid())
         OR profile_id = auth.uid());
CREATE POLICY moment_access_insert ON moment_access FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND m.author_id = auth.uid()));
CREATE POLICY moment_access_delete ON moment_access FOR DELETE
  USING (EXISTS (SELECT 1 FROM moments m WHERE m.id = moment_id AND m.author_id = auth.uid()));

-- ─── RESURFACING RULES ───────────────────────────────────────────────────────
CREATE POLICY resurfacing_rules_all ON resurfacing_rules
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = auth.uid());
