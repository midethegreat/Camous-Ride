const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Optimization for Reanimated and stability
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Ensure node_modules are resolved correctly
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs"];

module.exports = config;
