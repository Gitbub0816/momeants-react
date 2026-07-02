import { useEffect } from 'react';
import * as Sentry from '../src/utils/crashReporter';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { ApiProvider } from '../src/context/ApiContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useOfflineQueue } from '../src/hooks/useOfflineQueue';
import { ErrorBoundary } from '../src/components/core/ErrorBoundary';
import { OfflineBanner } from '../src/components/core/OfflineBanner';
import { colors } from '@momeants/design';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 0 : 0.2,
});

function RootNavigator() {
  const { userId, isOnboarded, isLoading } = useAuth();
  useOfflineQueue(); // Flush queued moments whenever the app is foregrounded
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!userId && !inAuth) {
      router.replace('/(auth)/welcome');
    } else if (userId && !isOnboarded && !inOnboarding) {
      router.replace('/(onboarding)/your-name');
    } else if (userId && isOnboarded && (inAuth || inOnboarding)) {
      router.replace('/(tabs)/home');
    }
  }, [userId, isOnboarded, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink900 } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="moment/[id]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="spark/[id]" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="spark-settings" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="edit-profile" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="resurfacing-controls" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="delete-account" options={{ presentation: 'modal', headerShown: true }} />
      <Stack.Screen name="messages/[id]" options={{ presentation: 'card', headerShown: true }} />
      <Stack.Screen name="clique/[id]" options={{ presentation: 'card', headerShown: true }} />
      <Stack.Screen name="sparks/index" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="privacy" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/reset-password" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="calendar/new" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  // Fonts load in the background; the app renders immediately with system
  // fonts and swaps in the brand faces when ready. Startup never blocks.
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ApiProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <RootNavigator />
            <OfflineBanner />
          </AuthProvider>
        </ApiProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
