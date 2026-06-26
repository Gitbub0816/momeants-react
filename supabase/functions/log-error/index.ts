// Receives crash reports from the mobile app and stores them in the error_logs table.
// Called by apps/mobile/src/utils/crashReporter.ts in production.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { message?: string; stack?: string; context?: unknown; timestamp?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Extract optional user ID from JWT if present
  let userId: string | null = null;
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { data } = await supabase.auth.getUser(authHeader.slice(7));
      userId = data.user?.id ?? null;
    } catch {
      // anonymous error report — fine
    }
  }

  const { error } = await supabase.from('error_logs').insert({
    user_id: userId,
    message: body.message ?? 'Unknown error',
    stack: body.stack ?? null,
    context: body.context ?? null,
    occurred_at: body.timestamp ?? new Date().toISOString(),
  });

  if (error) {
    // Don't expose DB errors to clients
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
