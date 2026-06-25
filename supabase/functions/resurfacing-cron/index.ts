// Supabase Edge Function — runs daily via pg_cron or Supabase scheduled functions.
// Generates resurfacing notifications for all users who have memories from this day in prior years.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const RESURFACING_LABELS: Record<number, string> = {
  1: 'One year ago today',
  2: 'Two years ago today',
  3: 'Three years ago today',
};

function resurfaceLabel(yearsAgo: number): string {
  return RESURFACING_LABELS[yearsAgo] ?? `${yearsAgo} years ago today`;
}

Deno.serve(async () => {
  // Get all users with moments from this calendar day in prior years
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let processed = 0;

  for (const user of users ?? []) {
    const { data: moments } = await supabase
      .rpc('get_resurfaced_moments', { viewer: user.id });

    if (!moments?.length) continue;

    const moment = moments[0];
    const yearsAgo = new Date().getFullYear() - new Date(moment.created_at).getFullYear();

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'resurfaced_memory',
      title: resurfaceLabel(yearsAgo),
      body: moment.caption
        ? `"${moment.caption.slice(0, 80)}"`
        : 'A memory is glowing again.',
      payload: { moment_id: moment.id, years_ago: yearsAgo },
    });

    processed++;
  }

  return new Response(
    JSON.stringify({ ok: true, processed }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
