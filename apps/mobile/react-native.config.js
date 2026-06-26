const path = require('path');

const workspaceRoot = path.resolve(__dirname, '../..');

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  // Point autolinking to react-native in the monorepo workspace root
  reactNativePath: path.resolve(workspaceRoot, 'node_modules/react-native'),
  dependencies: {
    // Ensure native deps resolve from workspace root node_modules
    'react-native': {
      root: path.resolve(workspaceRoot, 'node_modules/react-native'),
    },
  },
};
