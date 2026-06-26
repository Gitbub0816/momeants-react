import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CreateMomentInput } from '@momeants/types';
import { useApi } from '../context/ApiContext';

const QUEUE_KEY = '@momeants/offline_moment_queue';

interface QueuedMoment {
  id: string;
  input: CreateMomentInput;
  queuedAt: string;
}

async function readQueue(): Promise<QueuedMoment[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedMoment[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueMoment(input: CreateMomentInput): Promise<void> {
  const queue = await readQueue();
  queue.push({ id: `queued-${Date.now()}`, input, queuedAt: new Date().toISOString() });
  await writeQueue(queue);
}

export function useOfflineQueue() {
  const api = useApi();
  const flushing = useRef(false);

  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    try {
      const queue = await readQueue();
      if (queue.length === 0) return;

      const remaining: QueuedMoment[] = [];
      for (const item of queue) {
        try {
          await api.createMoment(item.input);
        } catch {
          remaining.push(item);
        }
      }
      await writeQueue(remaining);
    } finally {
      flushing.current = false;
    }
  }, [api]);

  useEffect(() => {
    // Flush on app foreground — if moments were queued while offline, submit them now
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') flush();
    });

    // Attempt flush on mount
    flush();

    return () => sub.remove();
  }, [flush]);

  return { flush };
}
