import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Deletes all user data then removes the auth user.
// Must be called with the user's JWT — enforces that users can only delete themselves.
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401 });
  }

  // User-scoped client to verify identity
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Admin client for cascading deletion
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const userId = user.id;

    // Delete Storage objects (moments bucket)
    const { data: files } = await adminClient.storage.from('moments').list(userId);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await adminClient.storage.from('moments').remove(paths);
    }

    // Delete all user data — cascades handle child rows via FK constraints
    await adminClient.from('spark_deliveries').delete().eq('user_id', userId);
    await adminClient.from('spark_settings').delete().eq('user_id', userId);
    await adminClient.from('notifications').delete().eq('user_id', userId);
    await adminClient.from('push_tokens').delete().eq('user_id', userId);
    await adminClient.from('circle_members').delete().eq('user_id', userId);
    await adminClient.from('reactions').delete().eq('user_id', userId);
    await adminClient.from('comments').delete().eq('author_id', userId);
    await adminClient.from('moments').delete().eq('author_id', userId);
    await adminClient.from('profiles').delete().eq('id', userId);

    // Delete the auth user last
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('delete-account error:', err);
    return new Response(JSON.stringify({ error: 'Failed to delete account' }), { status: 500 });
  }
});
