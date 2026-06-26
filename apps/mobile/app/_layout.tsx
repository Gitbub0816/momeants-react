import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
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
import { ErrorBoundary } from '../src/components/core/ErrorBoundary';
import { OfflineBanner } from '../src/components/core/OfflineBanner';
import { colors } from '@momeants/design';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { userId, isOnboarded, isLoading } = useAuth();
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
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
