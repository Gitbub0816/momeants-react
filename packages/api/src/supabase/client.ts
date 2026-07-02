import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import type { Database } from './database.types';

let _client: ReturnType<typeof createClient<Database>> | null = null;

// `storage` must be provided on React Native (e.g. AsyncStorage) or the auth
// session will not survive an app restart and every session-dependent call
// will fail after relaunch.
export function getSupabaseClient(url: string, anonKey: string, storage?: SupportedStorage) {
  if (!_client) {
    _client = createClient<Database>(url, anonKey, {
      auth: {
        ...(storage ? { storage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}
