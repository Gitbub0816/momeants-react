// Thin crash reporter — logs in dev, sends to Supabase in production.
// Drop-in compatible with Sentry's captureException API.
// Replace the body of captureException with Sentry.captureException once
// @sentry/react-native is installed.

const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
const LOG_ENDPOINT = process.env.EXPO_PUBLIC_SUPABASE_URL
  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/log-error`
  : null;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('[crash]', err.message, context ?? '');

  if (!IS_DEV && LOG_ENDPOINT) {
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        message: err.message,
        stack: err.stack,
        context,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }
}

export function init(_options?: Record<string, unknown>): void {
  // No-op until Sentry is installed
}
