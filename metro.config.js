const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");
const path = require("path");

let config = getDefaultConfig(__dirname);

// Apply Rork wrapper first
config = withRorkMetro(config);

// Then apply our path alias configuration
config.resolver = config.resolver || {};
config.resolver.alias = {
  "@": path.resolve(__dirname),
};

module.exports = config;
