import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Simple network status via fetch probe — avoids NetInfo native module dependency
let isOnline = true;

async function probe(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 5000);
    await fetch('https://www.apple.com/library/test/success.html', {
      method: 'HEAD',
      signal: ctrl.signal,
    });
    clearTimeout(id);
    return true;
  } catch {
    return false;
  }
}

export function useNetworkStatus() {
  const [online, setOnline] = useState(isOnline);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const result = await probe();
      if (!cancelled) {
        isOnline = result;
        setOnline(result);
      }
    };

    check();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') check();
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return online;
}
