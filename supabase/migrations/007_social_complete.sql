-- ============================================================
-- Migration 007: Social tables + spark fixes (replaces 006a-d)
-- Safe to run after migrations 001-005.
-- ============================================================

-- ── FIX SPARK SCORE COLUMNS (005 used NUMERIC(3,2), values go to 10) ────────
ALTER TABLE spark_library
  ALTER COLUMN memory_potential     TYPE INT USING memory_potential::INT,
  ALTER COLUMN conversation_score   TYPE INT USING conversation_score::INT,
  ALTER COLUMN emotional_weight     TYPE INT USING emotional_weight::INT,
  ALTER COLUMN novelty_score        TYPE INT USING novelty_score::INT;

-- ── FIX SPARK IDS: UUID → TEXT ───────────────────────────────────────────────
ALTER TABLE spark_deliveries DROP CONSTRAINT IF EXISTS spark_deliveries_spark_id_fkey;
ALTER TABLE spark_library    ALTER COLUMN id       TYPE TEXT;
ALTER TABLE spark_deliveries ALTER COLUMN spark_id TYPE TEXT;
ALTER TABLE spark_deliveries
  ADD CONSTRAINT spark_deliveries_spark_id_fkey
  FOREIGN KEY (spark_id) REFERENCES spark_library(id);

-- ── CLIQUES (create clique_members BEFORE the cliques RLS policy that refs it)
CREATE TABLE IF NOT EXISTS cliques (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  type         TEXT NOT NULL,
  emoji        TEXT,
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  moment_count INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clique_members (
  clique_id UUID NOT NULL REFERENCES cliques(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (clique_id, user_id)
);

ALTER TABLE cliques        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clique_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cliques: read if member or owner" ON cliques;
CREATE POLICY "cliques: read if member or owner" ON cliques FOR SELECT USING (
  owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM clique_members WHERE clique_id = id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "cliques: insert own" ON cliques;
CREATE POLICY "cliques: insert own" ON cliques FOR INSERT WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "cliques: update own" ON cliques;
CREATE POLICY "cliques: update own" ON cliques FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "cliques: delete own" ON cliques;
CREATE POLICY "cliques: delete own" ON cliques FOR DELETE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "clique_members: read if member or owner" ON clique_members;
CREATE POLICY "clique_members: read if member or owner" ON clique_members FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM cliques WHERE id = clique_id AND owner_id = auth.uid())
);
DROP POLICY IF EXISTS "clique_members: owner inserts" ON clique_members;
CREATE POLICY "clique_members: owner inserts" ON clique_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM cliques WHERE id = clique_id AND owner_id = auth.uid())
);
DROP POLICY IF EXISTS "clique_members: owner deletes" ON clique_members;
CREATE POLICY "clique_members: owner deletes" ON clique_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM cliques WHERE id = clique_id AND owner_id = auth.uid())
);

-- ── CONNECTION REQUESTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connection_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conn_req: read own" ON connection_requests;
CREATE POLICY "conn_req: read own" ON connection_requests FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
DROP POLICY IF EXISTS "conn_req: insert from self" ON connection_requests;
CREATE POLICY "conn_req: insert from self" ON connection_requests FOR INSERT
  WITH CHECK (from_user_id = auth.uid());
DROP POLICY IF EXISTS "conn_req: recipient updates status" ON connection_requests;
CREATE POLICY "conn_req: recipient updates status" ON connection_requests FOR UPDATE
  USING (to_user_id = auth.uid());

-- ── MOMENT SHARES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS moment_shares (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id    UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE moment_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moment_shares: read own" ON moment_shares;
CREATE POLICY "moment_shares: read own" ON moment_shares FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
DROP POLICY IF EXISTS "moment_shares: insert from self" ON moment_shares;
CREATE POLICY "moment_shares: insert from self" ON moment_shares FOR INSERT
  WITH CHECK (from_user_id = auth.uid());

-- ── CALENDAR EVENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  date         DATE NOT NULL,
  type         TEXT NOT NULL,
  emoji        TEXT,
  person_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  person_name  TEXT,
  clique_name  TEXT,
  moment_id    UUID REFERENCES moments(id) ON DELETE SET NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "calendar_events: own only" ON calendar_events;
CREATE POLICY "calendar_events: own only" ON calendar_events FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── CONVERSATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type       TEXT NOT NULL DEFAULT 'dm' CHECK (type IN ('dm','group')),
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE conversations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations: read if participant" ON conversations;
CREATE POLICY "conversations: read if participant" ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "conversations: insert" ON conversations;
CREATE POLICY "conversations: insert" ON conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "conv_participants: read own" ON conversation_participants;
CREATE POLICY "conv_participants: read own" ON conversation_participants FOR SELECT
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "conv_participants: insert" ON conversation_participants;
CREATE POLICY "conv_participants: insert" ON conversation_participants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "messages: read if participant" ON messages;
CREATE POLICY "messages: read if participant" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversation_participants
          WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "messages: insert own" ON messages;
CREATE POLICY "messages: insert own" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTR(NEW.id::TEXT, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── SPARK LIBRARY SEED (42 sparks) ───────────────────────────────────────────
INSERT INTO spark_library (id, title, description, body, category, game_type, estimated_minutes, min_players, max_players, requires_photo, requires_conversation, requires_location, holiday, season, relationship_types, memory_potential, conversation_score, emotional_weight, novelty_score, completion_cta, prompts, tags) VALUES

('conv-this-or-that-1','This or That','Quick choices, real conversations.','Take turns answering. No wrong answers — explain your choice.','conversation','this_or_that',10,2,8,false,true,false,null,null,array['friend','family','partner','clique'],6,9,4,7,'Save this moment',array['Mountains or ocean?','Early bird or night owl?','Cook at home or go out?','Call or text?','Dogs or cats?'],array['light','social','easy','group']),

('conv-would-you-rather-1','Would You Rather','Two doors. One choice.','Each person picks their answer and defends it.','conversation','would_you_rather',12,2,8,false,true,false,null,null,array['friend','family','partner','clique'],5,9,4,7,'Save this moment',array['Be famous for 5 years or comfortably unknown forever?','Never be cold or never be hot?','Know the beginning or the end?','Live in the past or the future?','Have more time or more money?'],array['light','social','easy','group']),

('conv-never-have-i-ever-1','Never Have I Ever','Find out what you didn''t know.','Take turns. Anyone who has done it shares why.','conversation','never_have_i_ever',15,2,10,false,true,false,null,null,array['friend','family','clique'],7,10,6,8,'Save this game',array['Never have I ever stayed up all night.','Never have I ever cried at a movie.','Never have I ever been on a spontaneous trip.','Never have I ever called in sick when I wasn''t.','Never have I ever kept a journal.'],array['fun','social','revealing','group']),

('conv-finish-sentence-1','Finish the Sentence','One sentence. Infinite directions.','Take turns completing each sentence. No filtering allowed.','conversation','finish_the_sentence',15,2,6,false,true,false,null,null,array['friend','family','partner'],8,10,8,8,'Save this moment',array['The happiest I''ve ever been was...','I never told you...','I still remember when we...','The thing I appreciate most about you is...','One day I want to...'],array['emotional','deep','intimate']),

('conv-rapid-fire-1','Rapid Fire','Ten questions. No thinking allowed.','Answer as fast as you can. First thing that comes to mind only.','conversation','rapid_fire',8,2,10,false,true,false,null,null,array['friend','family','partner','clique'],5,8,3,6,'Save this moment',array['Favorite meal your mom made?','Most embarrassing moment?','Dream vacation?','What makes you laugh hardest?','Childhood hero?','Last time you cried?','Hidden talent?','Weirdest habit?','Biggest fear?','What would you do with a free day?'],array['fun','light','quick']),

('conv-deep-1','One Real Question','Just one. But make it count.','Ask the question you''ve been thinking about. Then listen.','conversation','deep_question',20,2,2,false,true,false,null,null,array['friend','family','partner'],9,10,9,9,'Save this conversation',array['What''s something you''ve never told anyone?','What do you think about before you fall asleep?','When did you last feel truly proud of yourself?','What''s a version of your life you didn''t choose?','What do you hope people remember about you?'],array['emotional','deep','intimate','1-on-1']),

('creative-one-word-story','One Word Story','Build a story one word at a time.','Take turns adding exactly one word. See where the story goes.','creative','one_word_story',8,2,8,false,true,false,null,null,array['friend','family','clique'],6,8,3,9,'Save this story',null,array['fun','creative','group']),

('creative-emoji-story','Emoji Story','No words. Only emojis.','Tell the story of today using only emojis. Share with your circle.','creative','emoji_story',3,1,10,false,true,false,null,null,array[]::text[],6,8,3,7,'Save this story',null,array['fun','light','social','creative']),

('mem-guess-memory','Guess the Memory','Which memory is this? You tell me.','Share a vague clue about a shared memory. Everyone tries to guess which one.','memory','guess_the_memory',15,2,8,false,true,false,null,null,array['friend','family','partner','clique'],10,9,8,9,'Save this game',null,array['nostalgic','fun','group','memory']),

('mem-guess-year','Guess the Year','Old photos. Mysterious ages.','Share a childhood photo. Everyone guesses the year and your age.','memory','guess_the_year',15,2,10,true,true,false,null,null,array['friend','family','clique'],9,9,7,8,'Save this game',null,array['nostalgic','fun','group','childhood']),

('mem-guess-place','Guess the Place','Where was this taken?','Post a cropped or vague photo of a place. Who can guess where it is?','memory','guess_the_place',10,2,10,true,true,false,null,null,array['friend','family','clique'],8,8,5,8,'Save this game',null,array['fun','group','places','travel']),

('creative-caption-battle','Caption Battle','One photo. Everyone captions it.','Post a funny or mysterious photo. Everyone writes their best caption. Vote for the winner.','creative','caption_battle',10,2,15,true,true,false,null,null,array['friend','clique'],7,9,4,9,'Save the winner',null,array['fun','competitive','creative','group']),

('family-story-game','Family Story','A story only your family can tell.','Each family member adds one sentence to a shared story about your family.','family','family_story',20,2,15,false,true,false,null,null,array['family'],10,10,10,9,'Save this story',null,array['family','storytelling','irreplaceable']),

('family-story-grandparent','Ask Grandma or Grandpa','A story only they can tell.','Ask them about their happiest childhood memory. Record it if they''ll let you.','family','story_game',20,2,2,false,true,false,null,null,array['family'],10,10,10,10,'Save this story',null,array['family','history','storytelling','irreplaceable']),

('family-childhood-question','What Was It Like?','Ask a parent something you''ve never thought to ask.','Ask your mom or dad about the house they grew up in. Every detail.','storytelling','story_game',25,2,4,false,true,false,null,null,array['family'],10,10,9,10,'Save this story',array['Describe the house you grew up in.','What did you do after school?','Who was your best friend?','What was your family''s biggest tradition?','What did you want to be when you grew up?'],array['family','history','nostalgic','irreplaceable']),

('family-dinner-photo','Dinner Table','Before everyone scatters.','Take one photo of whoever is at the table with you tonight.','family','photo_challenge',2,1,10,true,false,false,null,null,array['family'],9,3,8,7,'Save this evening',null,array['family','daily','together']),

('clique-challenge-1','Clique Challenge','A challenge built for your crew.','Set a 24-hour group challenge. Everyone posts their result.','clique','clique_challenge',30,3,20,true,true,false,null,null,array['clique'],8,8,6,8,'Submit your entry',null,array['group','challenge','fun']),

('clique-pet-day','Pet Day','Everyone posts their pet. Or someone else''s.','Everyone in the group posts a photo of a pet today. No excuses.','clique','pet_day',5,2,20,true,true,false,null,null,array['clique'],7,8,5,6,'Post your pet',null,array['group','fun','light','social']),

('clique-scavenger','Photo Scavenger Hunt','Find them all. First one wins bragging rights.','Everyone has 24 hours to photograph all five things.','clique','group_challenge',60,2,20,true,true,false,null,null,array['clique'],9,9,6,9,'Submit your finds',array['Something older than you','Something blue you love','A door you''ve never noticed','Your shadow','Something that makes you smile'],array['group','adventure','challenge']),

('bestie-challenge-1','Bestie Challenge','How well do you really know each other?','Answer questions about each other simultaneously. Compare answers.','friendship','bestie_challenge',20,2,4,false,true,false,null,null,array['friend'],8,10,7,8,'Save your score',array['What''s my biggest fear?','What''s my go-to comfort food?','What would I do on a perfect Saturday?','What''s my most embarrassing memory?','What do I complain about most?'],array['bestie','competitive','fun','revealing']),

('mem-who-said-it','Who Said It?','Old texts, old quotes, old chaos.','Share a quote from a past group chat or memory. Everyone guesses who said it.','memory','who_said_it',12,3,10,false,true,false,null,null,array['friend','clique'],8,9,6,9,'Save the results',null,array['nostalgic','fun','group','memory']),

('rel-gratitude-round','Gratitude Round','Everyone says one thing they''re grateful for today.','Go around. Each person names one thing. No judgment, no minimizing.','relationship','gratitude_round',8,2,10,false,true,false,null,null,array['friend','family','clique'],8,9,9,7,'Save this moment',null,array['mindful','warm','group']),

('mem-then-and-now','Then and Now','The same place. Years apart.','Find a photo of a place from your past. Go back and take the same shot today.','memory','then_and_now',20,1,4,true,false,false,null,null,array['friend','family','partner'],10,6,9,10,'Save then and now',null,array['nostalgic','creative','milestone']),

('mem-recreation','Recreate a Memory','Same people. Same pose. Years later.','Find a group photo from years ago. Recreate it exactly.','memory','memory_recreation',20,2,10,true,true,false,null,null,array['friend','family','clique'],10,8,10,10,'Save then and now',null,array['nostalgic','milestone','group']),

('holiday-game-1','Holiday Tradition Quiz','What do you actually know about each other''s holidays?','Share your most unusual or beloved holiday tradition. Everyone guesses where it came from.','holiday','holiday_game',15,2,10,false,true,false,null,null,array['friend','family','clique'],8,9,7,8,'Save this game',null,array['holiday','group','traditions']),

('holiday-mothers-day','Mother''s Day','Tell her what she means to you.','Take a photo with your mom today. Tell her one thing you learned from her.','holiday','prompt',10,1,1,true,true,false,'mothers_day',null,array['family'],10,9,10,8,'Save this moment with her',null,array['holiday','family','emotional']),

('holiday-new-years','New Year''s Reflection','One moment from each month.','Go back through your photos. Find one moment from each month of the past year.','holiday','memory_game',20,1,1,false,false,false,'new_years',null,array[]::text[],10,5,9,9,'Save this year',null,array['holiday','reflection','annual']),

('important-day-game-1','Birthday Memories','Let''s find the best memory from this year.','For someone''s birthday, everyone shares their favorite memory with them.','anniversary','important_day_game',15,2,15,false,true,false,null,null,array['friend','family','clique'],10,10,10,8,'Save for them',null,array['birthday','milestone','emotional']),

('mem-draft-1','Memory Draft','Each person picks their top moment from a shared trip or event.','Look back at photos from a shared trip. Each person drafts (claims) their top 3.','memory','memory_draft',20,2,8,true,true,false,null,null,array['friend','family','clique'],10,9,8,9,'Save your picks',null,array['nostalgic','group','fun','trips']),

('creative-food-draft','Food Draft','Build your perfect meal. One ingredient at a time.','Take turns picking one dish or ingredient to add to your dream meal. No veto.','creative','food_draft',10,2,8,false,true,false,null,null,array['friend','family','clique'],5,8,3,7,'Save your dream meal',null,array['fun','light','food','creative']),

('disc-bucket-list','Bucket List Builder','What do you want to do together?','Each person adds one thing to the shared bucket list. No limits.','discovery','bucket_list_builder',10,2,10,false,true,false,null,null,array['friend','family','partner','clique'],9,9,8,9,'Save your list',null,array['dreams','future','connection']),

('photo-today-sky','Today''s Sky','One picture. Look up.','Step outside and photograph the sky right now. Whatever it looks like.','photo','photo_challenge',3,1,1,true,false,false,null,null,array[]::text[],7,2,5,6,'Save this sky',null,array['solo','quick','nature','daily']),

('photo-golden-hour','Golden Hour','The light only lasts a few minutes.','Find the best light near you right now and capture it.','photo','photo_challenge',5,1,4,true,false,false,null,'summer',array[]::text[],9,3,7,7,'Save this light',null,array['nature','beautiful','daily']),

('photo-ordinary','Beautiful Ordinary','Find the extraordinary in what''s right in front of you.','Photograph something ordinary that you''ve stopped noticing. Make it beautiful.','photo','photo_challenge',5,1,1,true,false,false,null,null,array[]::text[],8,2,6,8,'Save this moment',null,array['solo','mindful','daily','creative']),

('photo-morning-coffee','Morning Coffee','Slow down for one minute.','Before you drink it, photograph what''s in your cup and around it.','photo','photo_challenge',2,1,1,true,false,false,null,null,array[]::text[],6,1,5,5,'Save this morning',null,array['morning','solo','cozy','daily']),

('rel-send-photo','Send a Memory','Send someone a photo that reminded you of them.','Find a photo from your camera roll that made you think of this person. Send it with one sentence.','relationship','prompt',3,1,1,false,true,false,null,null,array['friend','family','partner'],9,8,9,9,'Save this moment',null,array['thoughtful','connection','surprise']),

('rel-gratitude','Tell Them','Say the thing you''ve been meaning to say.','Tell someone something you''re grateful for about them. Out loud or in a message.','relationship','prompt',5,1,1,false,true,false,null,null,array['friend','family','partner'],10,10,10,9,'Save this moment',null,array['emotional','gratitude','connection']),

('rel-favorite-memory','Favorite Memory Together','Which one was it for them?','Ask someone what their favorite shared memory with you is. Then share yours.','relationship','conversation',10,2,2,false,true,false,null,null,array['friend','family','partner'],10,10,10,9,'Save this memory',null,array['nostalgia','deep','connection']),

('couple-recreate','Recreate It','Find an old photo and take it again.','Find a photo of the two of you from early on. Go to the same spot or pose. Recreate it.','couple','memory_recreation',15,2,2,true,true,false,null,null,array['partner'],10,7,9,10,'Save then and now',null,array['romantic','nostalgic','milestone']),

('couple-favorite-date','Best Date We Ever Had','You might disagree on which one.','Each describe your favorite date together. See if you picked the same one.','couple','conversation',15,2,2,false,true,false,null,null,array['partner'],9,9,9,8,'Save this conversation',null,array['romantic','nostalgia','connection']),

('seasonal-first-snow','First Snow','It only happens once a year.','Go outside. Take a picture. Then come back in somewhere warm.','seasonal','photo_challenge',5,1,6,true,false,false,null,'winter',array[]::text[],9,3,7,9,'Save this winter',null,array['seasonal','winter','nature']),

('seasonal-autumn-leaves','Autumn Leaves','Before they''re all gone.','Find the most beautiful tree near you. One photo.','seasonal','photo_challenge',10,1,4,true,false,false,null,'autumn',array[]::text[],8,2,6,7,'Save this autumn',null,array['seasonal','autumn','nature']),

('creative-six-words','Six Word Story','Your whole day. Six words.','Describe today in exactly six words. No more. No less.','creative','story_game',5,1,10,false,true,false,null,null,array[]::text[],8,7,5,8,'Save these six words',null,array['creative','writing','reflective','solo']),

('disc-different-route','Walk a Different Way','Same destination. New path.','On your next walk or commute, take a route you''ve never taken. See what you find.','discovery','prompt',20,1,4,true,false,false,null,null,array[]::text[],8,2,5,9,'Save what you found',null,array['exploration','adventure','solo','outdoor']),

('disc-hidden-gem','Hidden Gem','Every neighbourhood has one.','Find a spot near you that most people walk past. Photograph it.','discovery','photo_challenge',20,1,4,true,false,true,null,null,array[]::text[],8,3,6,9,'Save this discovery',null,array['exploration','local','outdoor'])

ON CONFLICT (id) DO UPDATE SET
  title             = EXCLUDED.title,
  description       = EXCLUDED.description,
  body              = EXCLUDED.body,
  tags              = EXCLUDED.tags,
  prompts           = EXCLUDED.prompts,
  memory_potential  = EXCLUDED.memory_potential,
  conversation_score= EXCLUDED.conversation_score,
  emotional_weight  = EXCLUDED.emotional_weight,
  novelty_score     = EXCLUDED.novelty_score;
