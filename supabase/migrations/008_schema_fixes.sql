-- ── Add clique_id to conversations ──────────────────────────────────────────
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS clique_id UUID REFERENCES cliques(id) ON DELETE SET NULL;

-- ── Add message type and media columns ───────────────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text','moment','spark','reaction'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS moment_id UUID REFERENCES moments(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS spark_id  UUID REFERENCES spark_library(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reaction_emoji TEXT;
ALTER TABLE messages ALTER COLUMN text DROP NOT NULL;

-- ── Fix push_tokens: add platform upsert support ──────────────────────────
-- updated_at column was referenced in code but missing from schema
ALTER TABLE push_tokens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE push_tokens ADD COLUMN IF NOT EXISTS platform TEXT;
-- Add unique constraint on (user_id, token) for upsert if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'push_tokens_user_token_unique'
  ) THEN
    ALTER TABLE push_tokens ADD CONSTRAINT push_tokens_user_token_unique UNIQUE (user_id, token);
  END IF;
END $$;
