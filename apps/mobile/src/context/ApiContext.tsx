import React, { createContext, useContext, useMemo } from 'react';
import { MockMomentsApi, SupabaseMomentsApi, getSupabaseClient } from '@momeants/api';
import type { MomentsApi } from '@momeants/types';

// ─── Config ──────────────────────────────────────────────────────────────────
// Set these in app.config.js or a .env file and expose via expo-constants.
// When SUPABASE_URL is not set, the app falls back to mock data for local dev.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function createApi(): MomentsApi {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const sb = getSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return new SupabaseMomentsApi(sb);
  }
  return new MockMomentsApi();
}

const ApiContext = createContext<MomentsApi | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo(() => createApi(), []);
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): MomentsApi {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used inside ApiProvider');
  return ctx;
}
