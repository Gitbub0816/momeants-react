const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../..');
const isProduction = process.env.APP_VARIANT === 'production';

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  reactNativePath: path.resolve(workspaceRoot, 'node_modules/react-native'),
  dependencies: {
    'react-native': {
      root: path.resolve(workspaceRoot, 'node_modules/react-native'),
    },
    // expo-dev-client is only needed for development builds; exclude its native
    // pods from production so ReactAppDependencyProvider timing issues don't block pod install
    ...(isProduction
      ? {
          'expo-dev-client': { platforms: { ios: null, android: null } },
          'expo-dev-launcher': { platforms: { ios: null, android: null } },
          'expo-dev-menu': { platforms: { ios: null, android: null } },
          'expo-dev-menu-interface': { platforms: { ios: null, android: null } },
        }
      : {}),
  },
};
