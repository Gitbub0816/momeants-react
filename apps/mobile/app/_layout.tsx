import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Catch any module-level crash before React mounts
let MODULE_ERROR: string | null = null;
try {
  require('../src/utils/crashReporter');
} catch (e: any) {
  MODULE_ERROR = `crashReporter: ${e?.message}`;
}

let _Stack: any, _useRouter: any, _useSegments: any;
try {
  const r = require('expo-router');
  _Stack = r.Stack; _useRouter = r.useRouter; _useSegments = r.useSegments;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `expo-router: ${e?.message}`; }

let _GestureHandlerRootView: any;
try {
  _GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `gesture-handler: ${e?.message}`; }

let _useFonts: any, _Inter400: any, _Inter500: any, _Inter600: any, _Inter700: any;
try {
  const r = require('@expo-google-fonts/inter');
  _useFonts = r.useFonts; _Inter400 = r.Inter_400Regular; _Inter500 = r.Inter_500Medium;
  _Inter600 = r.Inter_600SemiBold; _Inter700 = r.Inter_700Bold;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `inter fonts: ${e?.message}`; }

let _Playfair400: any, _Playfair700: any;
try {
  const r = require('@expo-google-fonts/playfair-display');
  _Playfair400 = r.PlayfairDisplay_400Regular; _Playfair700 = r.PlayfairDisplay_700Bold;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `playfair fonts: ${e?.message}`; }

let _ApiProvider: any;
try {
  _ApiProvider = require('../src/context/ApiContext').ApiProvider;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `ApiContext: ${e?.message}`; }

let _AuthProvider: any, _useAuth: any;
try {
  const r = require('../src/context/AuthContext');
  _AuthProvider = r.AuthProvider; _useAuth = r.useAuth;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `AuthContext: ${e?.message}`; }

let _ErrorBoundary: any;
try {
  _ErrorBoundary = require('../src/components/core/ErrorBoundary').ErrorBoundary;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `ErrorBoundary: ${e?.message}`; }

let _OfflineBanner: any;
try {
  _OfflineBanner = require('../src/components/core/OfflineBanner').OfflineBanner;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `OfflineBanner: ${e?.message}`; }

let _colors: any;
try {
  _colors = require('@momeants/design').colors;
} catch (e: any) { MODULE_ERROR = MODULE_ERROR ?? `@momeants/design: ${e?.message}`; }

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  // Always hide splash after 2s no matter what
  useEffect(() => {
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setReady(true);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;

  // If any module failed to import, show the error
  if (MODULE_ERROR) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050711', padding: 24, justifyContent: 'center' }}>
        <Text style={{ color: '#ff4444', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Module Load Error
        </Text>
        <ScrollView>
          <Text style={{ color: '#fff', fontSize: 13 }}>{MODULE_ERROR}</Text>
        </ScrollView>
      </View>
    );
  }

  const Stack = _Stack;
  const GestureHandlerRootView = _GestureHandlerRootView;
  const useFonts = _useFonts;
  const ApiProvider = _ApiProvider;
  const AuthProvider = _AuthProvider;
  const ErrorBoundary = _ErrorBoundary;
  const OfflineBanner = _OfflineBanner;

  return <AppShell />;
}

function AppShell() {
  const [fontsLoaded, fontError] = _useFonts({
    Inter_400Regular: _Inter400,
    Inter_500Medium: _Inter500,
    Inter_600SemiBold: _Inter600,
    Inter_700Bold: _Inter700,
    PlayfairDisplay_400Regular: _Playfair400,
    PlayfairDisplay_700Bold: _Playfair700,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050711', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#888', fontSize: 12 }}>Loading fonts…</Text>
      </View>
    );
  }

  return (
    <_GestureHandlerRootView style={{ flex: 1 }}>
      <_ErrorBoundary>
        <_ApiProvider>
          <_AuthProvider>
            <_OfflineBanner />
            <RootNavigator />
          </_AuthProvider>
        </_ApiProvider>
      </_ErrorBoundary>
    </_GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { userId, isOnboarded, isLoading } = _useAuth();
  const segments = _useSegments();
  const router = _useRouter();

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
    <_Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: _colors?.ink900 ?? '#050711' } }}>
      <_Stack.Screen name="(auth)" />
      <_Stack.Screen name="(onboarding)" />
      <_Stack.Screen name="(tabs)" />
      <_Stack.Screen name="moment/[id]" options={{ presentation: 'fullScreenModal' }} />
      <_Stack.Screen name="capture" options={{ presentation: 'fullScreenModal' }} />
      <_Stack.Screen name="spark/[id]" options={{ presentation: 'modal', headerShown: true }} />
      <_Stack.Screen name="spark-settings" options={{ presentation: 'modal', headerShown: true }} />
      <_Stack.Screen name="edit-profile" options={{ presentation: 'modal', headerShown: true }} />
      <_Stack.Screen name="resurfacing-controls" options={{ presentation: 'modal', headerShown: true }} />
      <_Stack.Screen name="notifications" options={{ presentation: 'modal', headerShown: true }} />
      <_Stack.Screen name="delete-account" options={{ presentation: 'modal', headerShown: true }} />
      <_Stack.Screen name="messages/[id]" options={{ presentation: 'card', headerShown: true }} />
      <_Stack.Screen name="clique/[id]" options={{ presentation: 'card', headerShown: true }} />
      <_Stack.Screen name="sparks/index" options={{ presentation: 'card', headerShown: false }} />
      <_Stack.Screen name="privacy" options={{ presentation: 'modal', headerShown: false }} />
      <_Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
      <_Stack.Screen name="(auth)/reset-password" options={{ headerShown: false }} />
      <_Stack.Screen name="search" options={{ headerShown: false }} />
      <_Stack.Screen name="calendar/new" options={{ headerShown: false }} />
      <_Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
    </_Stack>
  );
}
