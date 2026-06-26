import React, { createContext, useContext, useState, useCallback } from 'react';
import { useApi } from './ApiContext';
import { useAuth } from './AuthContext';

interface OnboardingData {
  name: string;
  birthday: string;
  username: string;
  avatarUri: string | null;
  notificationsEnabled: boolean;
}

interface OnboardingContextValue {
  data: OnboardingData;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  complete: (notificationsEnabled: boolean) => Promise<void>;
}

const defaultData: OnboardingData = {
  name: '',
  birthday: '',
  username: '',
  avatarUri: null,
  notificationsEnabled: false,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const api = useApi();
  const { markOnboarded } = useAuth();
  const [data, setData] = useState<OnboardingData>(defaultData);

  const setField = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const complete = useCallback(async (notificationsEnabled: boolean) => {
    const final = { ...data, notificationsEnabled };
    try {
      await api.updateProfile({
        fullName: final.name,
        username: final.username,
        avatarUri: final.avatarUri ?? undefined,
      });
    } catch (e) {
      console.warn('[OnboardingContext] profile update failed:', e);
    }
    markOnboarded();
  }, [data, api, markOnboarded]);

  return (
    <OnboardingContext.Provider value={{ data, setField, complete }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
