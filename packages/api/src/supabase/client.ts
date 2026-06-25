import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient(url: string, anonKey: string) {
  if (!_client) {
    _client = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}
