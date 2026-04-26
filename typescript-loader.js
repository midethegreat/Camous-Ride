// Node.js loader to handle TypeScript files
// This prevents ERR_UNKNOWN_FILE_EXTENSION errors

const { pathToFileURL } = require("url");
const { readFileSync } = require("fs");

// Register TypeScript files to be handled as JavaScript
require.extensions[".ts"] = require.extensions[".js"];

// Override require to handle .ts files
const originalRequire = require;

module.exports = function (source, filename) {
  if (filename.endsWith(".ts")) {
    // For TypeScript files, just require them as JavaScript
    // This is a workaround for the expo-modules-core issue
    return originalRequire.apply(this, arguments);
  }
  return originalRequire.apply(this, arguments);
};
