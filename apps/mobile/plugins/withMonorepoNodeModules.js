const { withPodfileProperties } = require('@expo/config-plugins');
const path = require('path');

// Tells the Expo-generated Podfile to also search the monorepo workspace
// root for node_modules so CocoaPods can find hoisted packages like react-native.
const withMonorepoNodeModules = (config) => {
  return withPodfileProperties(config, (mod) => {
    const workspaceRoot = path.resolve(__dirname, '../../..');
    mod.modResults['WORKSPACE_NODE_MODULES'] = path.join(workspaceRoot, 'node_modules');
    return mod;
  });
};

module.exports = withMonorepoNodeModules;
