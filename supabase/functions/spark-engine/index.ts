import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface SparkRow {
  id: string;
  category: string;
  game_type: string;
  relationship_types: string[];
  tags: string[];
  memory_potential: number;
  conversation_score: number;
  emotional_weight: number;
  novelty_score: number;
  requires_location: boolean;
  requires_photo: boolean;
  holiday: string | null;
  season: string | null;
}

interface UserContext {
  userId: string;
  settings: {
    enabled_categories: string[];
    allow_location: boolean;
    allow_holidays: boolean;
    frequency_per_week: number;
  };
  recentSparkIds: string[];
  momentCount: number;
  circleSize: number;
}

function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function scoreSparkForUser(spark: SparkRow, ctx: UserContext): number {
  let score = 0;

  // Category match
  if (ctx.settings.enabled_categories.includes(spark.category)) score += 20;

  // Location filter
  if (spark.requires_location && !ctx.settings.allow_location) return -1;

  // Holiday filter
  if (spark.holiday && !ctx.settings.allow_holidays) return -1;

  // Season bonus
  const currentSeason = getSeason();
  if (spark.season === currentSeason) score += 10;

  // Novelty — prefer not recently seen
  if (!ctx.recentSparkIds.includes(spark.id)) score += 15;

  // Engagement weights
  score += spark.memory_potential * 20;
  score += spark.conversation_score * 15;
  score += spark.novelty_score * 10;

  // Circle size boost for social sparks
  if (ctx.circleSize >= 3 && spark.game_type === 'group_challenge') score += 10;

  // Early user — simpler prompts
  if (ctx.momentCount < 5) {
    if (['photo_challenge', 'prompt', 'conversation'].includes(spark.game_type)) score += 8;
  }

  return score;
}

function buildRecommendationReason(spark: SparkRow): string {
  const reasons: string[] = [];
  const season = getSeason();

  if (spark.season === season) reasons.push(`Perfect for ${season}`);
  if (spark.holiday) reasons.push(`Great for ${spark.holiday}`);
  if (spark.conversation_score >= 0.8) reasons.push('Sparks deep connection');
  if (spark.memory_potential >= 0.8) reasons.push('Creates lasting memories');
  if (spark.category === 'family') reasons.push('Brings your family closer');
  if (spark.category === 'couple') reasons.push('A moment just for two');
  if (spark.game_type === 'photo_challenge') reasons.push('Capture something beautiful');

  return reasons.length > 0
    ? reasons[0]
    : 'A little nudge to create something meaningful';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400 });
    }

    // Get user spark settings
    const { data: settings } = await supabase
      .from('spark_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!settings?.enabled) {
      return new Response(JSON.stringify({ delivered: false, reason: 'sparks disabled' }), {
        status: 200,
      });
    }

    // Check if already delivered today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingDelivery } = await supabase
      .from('spark_deliveries')
      .select('id')
      .eq('user_id', user_id)
      .gte('delivered_at', `${today}T00:00:00Z`)
      .in('status', ['pending', 'accepted'])
      .limit(1)
      .single();

    if (existingDelivery) {
      return new Response(JSON.stringify({ delivered: false, reason: 'already delivered today' }), {
        status: 200,
      });
    }

    // Check frequency (count deliveries this week)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: weekCount } = await supabase
      .from('spark_deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .gte('delivered_at', weekAgo);

    if ((weekCount ?? 0) >= (settings.frequency_per_week ?? 3)) {
      return new Response(
        JSON.stringify({ delivered: false, reason: 'frequency limit reached' }),
        { status: 200 }
      );
    }

    // Get recently delivered spark IDs (last 30 days) to avoid repeats
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentDeliveries } = await supabase
      .from('spark_deliveries')
      .select('spark_id')
      .eq('user_id', user_id)
      .gte('delivered_at', monthAgo);

    const recentSparkIds = (recentDeliveries ?? []).map((d) => d.spark_id);

    // Get user moment count and circle size for context
    const [{ count: momentCount }, { count: circleSize }] = await Promise.all([
      supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user_id),
      supabase
        .from('circle_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id),
    ]);

    const ctx: UserContext = {
      userId: user_id,
      settings,
      recentSparkIds,
      momentCount: momentCount ?? 0,
      circleSize: circleSize ?? 0,
    };

    // Fetch active sparks matching enabled categories
    const { data: sparks } = await supabase
      .from('spark_library')
      .select('*')
      .eq('is_active', true)
      .overlaps('category', settings.enabled_categories);

    if (!sparks || sparks.length === 0) {
      return new Response(JSON.stringify({ delivered: false, reason: 'no sparks available' }), {
        status: 200,
      });
    }

    // Score and rank
    const scored = sparks
      .map((s) => ({ spark: s, score: scoreSparkForUser(s as SparkRow, ctx) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return new Response(JSON.stringify({ delivered: false, reason: 'no eligible sparks' }), {
        status: 200,
      });
    }

    // Pick from top 3 with some randomness
    const topN = Math.min(3, scored.length);
    const chosen = scored[Math.floor(Math.random() * topN)].spark as SparkRow;

    const { data: delivery, error } = await supabase
      .from('spark_deliveries')
      .insert({
        spark_id: chosen.id,
        user_id,
        recommendation_reason: buildRecommendationReason(chosen),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to insert delivery:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ delivered: true, delivery_id: delivery.id, spark_id: chosen.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Spark engine error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
