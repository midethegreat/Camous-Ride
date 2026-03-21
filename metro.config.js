const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

let config = getDefaultConfig(__dirname);

// Apply our path alias configuration
config.resolver = config.resolver || {};
config.resolver.alias = {
  "@": path.resolve(__dirname),
};

// Disable New Architecture features to fix TurboModule errors
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = ["require", "import"];

module.exports = config;
