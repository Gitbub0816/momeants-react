-- Sparks: social micro-experience recommendation system

CREATE TABLE IF NOT EXISTS spark_library (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  body          TEXT NOT NULL,
  category      TEXT NOT NULL,
  game_type     TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  min_players   INTEGER NOT NULL DEFAULT 2,
  max_players   INTEGER NOT NULL DEFAULT 10,
  requires_photo       BOOLEAN NOT NULL DEFAULT FALSE,
  requires_conversation BOOLEAN NOT NULL DEFAULT FALSE,
  requires_location    BOOLEAN NOT NULL DEFAULT FALSE,
  holiday       TEXT,
  season        TEXT,
  relationship_types   TEXT[] NOT NULL DEFAULT '{}',
  memory_potential     NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  conversation_score   NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  emotional_weight     NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  novelty_score        NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  completion_cta TEXT NOT NULL DEFAULT 'Save this moment',
  prompts       TEXT[],
  tags          TEXT[] NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spark_settings (
  user_id                UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  enabled                BOOLEAN NOT NULL DEFAULT TRUE,
  frequency_per_week     INTEGER NOT NULL DEFAULT 3,
  quiet_hours_start      TEXT NOT NULL DEFAULT '22:00',
  quiet_hours_end        TEXT NOT NULL DEFAULT '08:00',
  enabled_categories     TEXT[] NOT NULL DEFAULT ARRAY['conversation','memory','relationship','family','couple','seasonal','photo','creative','discovery'],
  allow_location         BOOLEAN NOT NULL DEFAULT TRUE,
  allow_weather          BOOLEAN NOT NULL DEFAULT TRUE,
  allow_holidays         BOOLEAN NOT NULL DEFAULT TRUE,
  allow_relationship     BOOLEAN NOT NULL DEFAULT TRUE,
  allow_ai_personalization BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spark_deliveries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spark_id            UUID NOT NULL REFERENCES spark_library(id),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','dismissed','completed','expired')),
  delivered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  result_moment_id    UUID REFERENCES moments(id),
  recommendation_reason TEXT,
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS spark_participations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spark_delivery_id   UUID NOT NULL REFERENCES spark_deliveries(id) ON DELETE CASCADE,
  participant_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_name    TEXT NOT NULL,
  participant_avatar_uri TEXT,
  response            TEXT,
  photo_uri           TEXT,
  completed_at        TIMESTAMPTZ,
  UNIQUE(spark_delivery_id, participant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spark_deliveries_user_id ON spark_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_spark_deliveries_status ON spark_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_spark_deliveries_delivered_at ON spark_deliveries(delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_spark_library_category ON spark_library(category);
CREATE INDEX IF NOT EXISTS idx_spark_library_active ON spark_library(is_active);

-- Auto-expire pending deliveries (run periodically)
CREATE OR REPLACE FUNCTION expire_spark_deliveries() RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE spark_deliveries
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$;

-- Get today's spark for a user (pending, not expired)
CREATE OR REPLACE FUNCTION get_today_spark(p_user_id UUID)
RETURNS TABLE (
  delivery_id UUID,
  spark_id UUID,
  status TEXT,
  delivered_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result_moment_id UUID,
  recommendation_reason TEXT,
  title TEXT,
  description TEXT,
  body TEXT,
  category TEXT,
  game_type TEXT,
  estimated_minutes INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  requires_photo BOOLEAN,
  requires_conversation BOOLEAN,
  requires_location BOOLEAN,
  holiday TEXT,
  season TEXT,
  relationship_types TEXT[],
  memory_potential NUMERIC,
  conversation_score NUMERIC,
  emotional_weight NUMERIC,
  novelty_score NUMERIC,
  completion_cta TEXT,
  prompts TEXT[],
  tags TEXT[]
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS delivery_id,
    d.spark_id,
    d.status,
    d.delivered_at,
    d.accepted_at,
    d.completed_at,
    d.result_moment_id,
    d.recommendation_reason,
    s.title,
    s.description,
    s.body,
    s.category,
    s.game_type,
    s.estimated_minutes,
    s.min_players,
    s.max_players,
    s.requires_photo,
    s.requires_conversation,
    s.requires_location,
    s.holiday,
    s.season,
    s.relationship_types,
    s.memory_potential,
    s.conversation_score,
    s.emotional_weight,
    s.novelty_score,
    s.completion_cta,
    s.prompts,
    s.tags
  FROM spark_deliveries d
  JOIN spark_library s ON s.id = d.spark_id
  WHERE d.user_id = p_user_id
    AND d.status IN ('pending', 'accepted')
    AND d.expires_at > NOW()
    AND DATE(d.delivered_at AT TIME ZONE 'UTC') = DATE(NOW() AT TIME ZONE 'UTC')
  ORDER BY d.delivered_at DESC
  LIMIT 1;
END;
$$;

-- RLS
ALTER TABLE spark_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_participations ENABLE ROW LEVEL SECURITY;

-- spark_library is public read
CREATE POLICY "sparks are public" ON spark_library FOR SELECT USING (is_active = TRUE);

-- spark_settings: owner only
CREATE POLICY "users manage own settings" ON spark_settings
  FOR ALL USING (auth.uid() = user_id);

-- spark_deliveries: owner only
CREATE POLICY "users see own deliveries" ON spark_deliveries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users update own deliveries" ON spark_deliveries
  FOR UPDATE USING (auth.uid() = user_id);

-- spark_participations: participant or delivery owner
CREATE POLICY "participants see own participations" ON spark_participations
  FOR SELECT USING (
    auth.uid() = participant_id
    OR EXISTS (
      SELECT 1 FROM spark_deliveries d
      WHERE d.id = spark_delivery_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "participants insert own" ON spark_participations
  FOR INSERT WITH CHECK (auth.uid() = participant_id);

CREATE POLICY "participants update own" ON spark_participations
  FOR UPDATE USING (auth.uid() = participant_id);
