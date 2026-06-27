const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const appName = IS_DEV ? 'Momeants (Dev)' : IS_PREVIEW ? 'Momeants (Preview)' : 'Momeants';
const bundleId = IS_DEV
  ? 'com.momeants.app.dev'
  : IS_PREVIEW
  ? 'com.momeants.app.preview'
  : 'com.momeants.app';

module.exports = {
  name: appName,
  slug: 'momeants',
  version: '1.0.0',
  runtimeVersion: {
    policy: 'appVersion',
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'momeants',
  userInterfaceStyle: 'dark',
  backgroundColor: '#050711',
  splash: {
    image: './assets/splash.png',
    backgroundColor: '#050711',
    resizeMode: 'contain',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: bundleId,
    buildNumber: '1',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        'Momeants accesses your photos to let you capture and share moments.',
      NSCameraUsageDescription: 'Momeants uses your camera to capture moments.',
      NSLocationWhenInUseUsageDescription:
        'Momeants can tag your moments with a location if you allow it.',
      NSUserNotificationsUsageDescription:
        'Momeants sends you gentle reminders and resurfaces memories.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#050711',
    },
    package: bundleId,
    versionCode: 1,
    permissions: [
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'CAMERA',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
  },
  plugins: [
    './plugins/withMonorepoNodeModules',
    './plugins/withExcludeDevClientInProduction',
    'expo-router',
    'expo-font',
    [
      'expo-image-picker',
      {
        photosPermission:
          'Momeants accesses your photos to let you capture and share moments.',
        cameraPermission: 'Momeants uses your camera to capture moments.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Momeants uses your camera to capture moments.',
        microphonePermission: false,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#B57CFF',
        sounds: [],
      },
    ],
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: 'https://u.expo.dev/momeants',
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '4677228d-8e60-4acb-91fa-b38aaf83c269',
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};
