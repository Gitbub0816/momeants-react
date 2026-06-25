import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { AuthState } from '@momeants/types';
import { useApi } from './ApiContext';

const SESSION_KEY = 'momeants_session';

interface StoredSession {
  userId: string;
  isOnboarded: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  markOnboarded: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession(): Promise<StoredSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

async function writeSession(session: StoredSession | null): Promise<void> {
  try {
    if (session === null) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } else {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.warn('[AuthContext] Failed to persist session:', e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const [state, setState] = useState<AuthState>({
    userId: null,
    isOnboarded: false,
    isLoading: true,
  });

  useEffect(() => {
    readSession().then((session) => {
      if (session) {
        setState({ userId: session.userId, isOnboarded: session.isOnboarded, isLoading: false });
      } else {
        setState({ userId: null, isOnboarded: false, isLoading: false });
      }
    });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { userId } = await api.signInWithEmail(email, password);
      const session: StoredSession = { userId, isOnboarded: true };
      await writeSession(session);
      setState((s) => ({ ...s, userId, isOnboarded: true }));
    },
    [api]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { userId } = await api.signUpWithEmail(email, password);
      const session: StoredSession = { userId, isOnboarded: false };
      await writeSession(session);
      setState((s) => ({ ...s, userId, isOnboarded: false }));
    },
    [api]
  );

  const signOut = useCallback(async () => {
    await api.signOut();
    await writeSession(null);
    setState({ userId: null, isOnboarded: false, isLoading: false });
  }, [api]);

  const markOnboarded = useCallback(() => {
    setState((s) => {
      if (s.userId) {
        writeSession({ userId: s.userId, isOnboarded: true });
      }
      return { ...s, isOnboarded: true };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, markOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
