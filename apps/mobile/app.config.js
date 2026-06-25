const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  name: IS_DEV ? 'Momeants (Dev)' : 'Momeants',
  slug: 'momeants',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'momeants',
  userInterfaceStyle: 'dark',
  backgroundColor: '#050711',
  splash: {
    backgroundColor: '#050711',
    resizeMode: 'contain',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: IS_DEV ? 'com.momeants.app.dev' : 'com.momeants.app',
  },
  android: {
    adaptiveIcon: { backgroundColor: '#050711' },
    package: IS_DEV ? 'com.momeants.app.dev' : 'com.momeants.app',
  },
  plugins: [
    'expo-router',
    'expo-font',
    ['expo-image-picker', { photosPermission: 'Momeants accesses your photos to let you capture moments.' }],
    ['expo-camera', { cameraPermission: 'Momeants uses your camera to capture moments.' }],
    ['expo-notifications', { icon: './assets/icon.png', color: '#B57CFF' }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};
