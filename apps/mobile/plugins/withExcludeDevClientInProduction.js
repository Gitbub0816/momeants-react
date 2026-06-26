const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// In production builds, expo-dev-launcher depends on ReactAppDependencyProvider
// which isn't registered until use_react_native! runs, causing pod install to fail.
// Exclude expo-dev-* packages from Expo's autolinking for production builds.
const withExcludeDevClientInProduction = (config) => {
  if (process.env.APP_VARIANT !== 'production') return config;

  return withDangerousMod(config, [
    'ios',
    (mod) => {
      const podfilePath = path.join(mod.modRequest.platformProjectRoot, 'Podfile');
      let content = fs.readFileSync(podfilePath, 'utf-8');

      // Replace bare use_expo_modules! with one that excludes dev-only packages
      content = content.replace(
        /use_expo_modules!\s*$/m,
        "use_expo_modules!(exclude: ['expo-dev-launcher', 'expo-dev-menu', 'expo-dev-menu-interface', 'expo-dev-client'])"
      );

      fs.writeFileSync(podfilePath, content);
      return mod;
    },
  ]);
};

module.exports = withExcludeDevClientInProduction;
