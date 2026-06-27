const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// expo-dev-launcher is pulled in as a transitive dep of expo itself and
// depends on ReactAppDependencyProvider which isn't registered until
// use_react_native! runs, so pod install fails. Exclude these pods from
// Expo's use_expo_modules! autolinking for all iOS builds.
const withExcludeDevLauncher = (config) => {
  return withDangerousMod(config, [
    'ios',
    (mod) => {
      const podfilePath = path.join(mod.modRequest.platformProjectRoot, 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        console.warn('[withExcludeDevLauncher] Podfile not found at:', podfilePath);
        return mod;
      }

      let content = fs.readFileSync(podfilePath, 'utf-8');

      const EXCLUDE = "exclude: ['expo-dev-launcher', 'expo-dev-menu', 'expo-dev-menu-interface']";

      // Handle bare call: use_expo_modules!
      if (content.includes('use_expo_modules!') && !content.includes('expo-dev-launcher')) {
        // Already excluded — nothing to do
        return mod;
      }

      // Replace bare call (most common form in generated Podfile)
      const result = content.replace('use_expo_modules!', `use_expo_modules!(${EXCLUDE})`);

      if (result === content) {
        console.warn('[withExcludeDevLauncher] use_expo_modules! not found in Podfile — skipping');
      } else {
        console.log('[withExcludeDevLauncher] Patched Podfile to exclude expo-dev-launcher');
        fs.writeFileSync(podfilePath, result);
      }

      return mod;
    },
  ]);
};

module.exports = withExcludeDevLauncher;
