import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthState } from '@momeants/types';
import { useApi } from './ApiContext';

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  markOnboarded: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const [state, setState] = useState<AuthState>({
    userId: null,
    isOnboarded: false,
    isLoading: true,
  });

  useEffect(() => {
    // In a real app, restore persisted auth session here
    setTimeout(() => {
      setState({ userId: null, isOnboarded: false, isLoading: false });
    }, 500);
  }, []);

  async function signIn(email: string, password: string) {
    const { userId } = await api.signInWithEmail(email, password);
    setState((s) => ({ ...s, userId, isOnboarded: true }));
  }

  async function signUp(email: string, password: string) {
    const { userId } = await api.signUpWithEmail(email, password);
    setState((s) => ({ ...s, userId, isOnboarded: false }));
  }

  async function signOut() {
    await api.signOut();
    setState({ userId: null, isOnboarded: false, isLoading: false });
  }

  function markOnboarded() {
    setState((s) => ({ ...s, isOnboarded: true }));
  }

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
