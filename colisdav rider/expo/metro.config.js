const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..", "..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo/workspace
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force Metro to resolve (and use) the same React Native from workspace root
config.resolver.disableHierarchicalLookup = true;

// 4. Optimization for Reanimated and stability
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// 5. CRITICAL: Enable package exports to fix Babel runtime resolution
// This is essential for React Native 0.76+ in monorepos
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["require", "import", "react-native"];

module.exports = config;
