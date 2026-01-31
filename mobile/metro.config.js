const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Add monorepo root to existing watchFolders (don't replace defaults)
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// Resolve modules from both mobile/node_modules and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Prevent Metro from resolving duplicate React copies from root
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
