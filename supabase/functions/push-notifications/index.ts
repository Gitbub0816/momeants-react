// Triggered by database webhook when a notification row is inserted.
// Sends an Expo push notification to the user's device.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    user_id: string;
    title: string;
    body: string;
    payload: Record<string, unknown>;
  };
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const { record } = payload;

  // Fetch the user's Expo push token (stored in profiles or a separate push_tokens table)
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', record.user_id);

  if (!tokens?.length) {
    return new Response(JSON.stringify({ skipped: 'no_token' }), { status: 200 });
  }

  const messages = tokens.map((t) => ({
    to: t.token,
    title: record.title,
    body: record.body,
    data: record.payload,
    sound: 'default',
  }));

  const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  const result = await expoRes.json();
  return new Response(JSON.stringify(result), { status: 200 });
});
