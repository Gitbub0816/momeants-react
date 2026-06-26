import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  // Allow manual trigger via POST or scheduled cron
  const today = new Date().toISOString().split('T')[0];

  // 1. Get all users who have sparks enabled and haven't received one today
  const { data: eligibleUsers, error: userErr } = await supabase
    .from('spark_settings')
    .select('user_id, enabled_categories, allow_location, allow_holidays, allow_relationship, frequency_per_week')
    .eq('enabled', true);

  if (userErr) return new Response(JSON.stringify({ error: userErr.message }), { status: 500 });
  if (!eligibleUsers?.length) return new Response(JSON.stringify({ delivered: 0 }), { status: 200 });

  // 2. Filter out users who already got a spark today
  const { data: todayDeliveries } = await supabase
    .from('spark_deliveries')
    .select('user_id')
    .gte('delivered_at', `${today}T00:00:00Z`);

  const alreadyDelivered = new Set((todayDeliveries ?? []).map((d: any) => d.user_id));
  const targets = eligibleUsers.filter((u: any) => !alreadyDelivered.has(u.user_id));

  if (!targets.length) return new Response(JSON.stringify({ delivered: 0, reason: 'all already delivered today' }), { status: 200 });

  // 3. Load spark library
  const { data: sparks, error: sparkErr } = await supabase
    .from('spark_library')
    .select('id, category, requires_location, holiday, relationship_types, tags')
    .eq('is_active', true);

  if (sparkErr || !sparks?.length) return new Response(JSON.stringify({ error: 'no sparks available' }), { status: 500 });

  const month = new Date().getMonth(); // 0-11
  const currentSeason = month >= 2 && month <= 4 ? 'spring'
    : month >= 5 && month <= 7 ? 'summer'
    : month >= 8 && month <= 10 ? 'autumn'
    : 'winter';

  let delivered = 0;
  const deliveries = [];

  for (const user of targets) {
    // Filter sparks to user's enabled categories
    const eligible = sparks.filter((s: any) => {
      if (!user.enabled_categories.includes(s.category)) return false;
      if (s.requires_location && !user.allow_location) return false;
      if (s.holiday && !user.allow_holidays) return false;
      return true;
    });

    if (!eligible.length) continue;

    // Pick a random spark, weighted toward seasonal matches
    const seasonal = eligible.filter((s: any) => s.season === currentSeason);
    const pool = seasonal.length > 0 && Math.random() < 0.3 ? seasonal : eligible;
    const spark = pool[Math.floor(Math.random() * pool.length)];

    deliveries.push({
      user_id: user.user_id,
      spark_id: spark.id,
      status: 'pending',
      delivered_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      recommendation_reason: seasonal.includes(spark) ? `Seasonal: ${currentSeason}` : 'Daily pick',
    });
    delivered++;
  }

  if (deliveries.length) {
    const { error: insertErr } = await supabase.from('spark_deliveries').insert(deliveries);
    if (insertErr) return new Response(JSON.stringify({ error: insertErr.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ delivered, total_eligible: targets.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
