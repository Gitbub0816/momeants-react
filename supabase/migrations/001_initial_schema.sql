-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  username        TEXT NOT NULL UNIQUE,
  tagline         TEXT,
  avatar_url      TEXT,
  city            TEXT,
  country         TEXT,
  default_privacy TEXT NOT NULL DEFAULT 'close_circle'
                    CHECK (default_privacy IN ('private','close_circle','selected_people')),
  onboarded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MOMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE moments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  caption       TEXT,
  visibility    TEXT NOT NULL DEFAULT 'close_circle'
                  CHECK (visibility IN ('private','close_circle','selected_people')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX moments_author_created ON moments(author_id, created_at DESC);
CREATE INDEX moments_created_at     ON moments(created_at DESC);

-- ─── MOMENT MOODS ────────────────────────────────────────────────────────────
CREATE TABLE moment_moods (
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  mood      TEXT NOT NULL
              CHECK (mood IN ('Peaceful','Grateful','Loved','Excited','Nostalgic','Proud','Free','Cozy','Adventurous')),
  sort_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (moment_id, mood)
);

-- ─── MOMENT PEOPLE ───────────────────────────────────────────────────────────
CREATE TABLE moment_people (
  moment_id  UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name_label TEXT NOT NULL,
  PRIMARY KEY (moment_id, name_label)
);

-- ─── MOMENT LOCATIONS ────────────────────────────────────────────────────────
CREATE TABLE moment_locations (
  moment_id UUID PRIMARY KEY REFERENCES moments(id) ON DELETE CASCADE,
  label     TEXT NOT NULL,
  city      TEXT,
  country   TEXT,
  lat       DOUBLE PRECISION,
  lng       DOUBLE PRECISION
);

-- ─── CIRCLE MEMBERS ──────────────────────────────────────────────────────────
CREATE TABLE circle_members (
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (owner_id, member_id),
  CHECK (owner_id <> member_id)
);

CREATE INDEX circle_member_lookup ON circle_members(member_id, owner_id);

-- ─── REACTIONS ───────────────────────────────────────────────────────────────
CREATE TABLE reactions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id  UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (moment_id, user_id, emoji)
);

CREATE INDEX reactions_moment ON reactions(moment_id);

-- ─── COMMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id  UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text       TEXT NOT NULL CHECK (char_length(text) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_moment ON comments(moment_id, created_at ASC);

-- ─── MOMENT ACCESS (selected_people) ─────────────────────────────────────────
CREATE TABLE moment_access (
  moment_id  UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (moment_id, profile_id)
);

-- ─── RESURFACING RULES ───────────────────────────────────────────────────────
CREATE TABLE resurfacing_rules (
  user_id           UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  hide_people_ids   UUID[]   NOT NULL DEFAULT '{}',
  hide_place_labels TEXT[]   NOT NULL DEFAULT '{}',
  hide_date_ranges  JSONB    NOT NULL DEFAULT '[]',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  payload    JSONB NOT NULL DEFAULT '{}',
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user ON notifications(user_id, created_at DESC);

-- ─── updated_at TRIGGER ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER moments_updated_at BEFORE UPDATE ON moments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
