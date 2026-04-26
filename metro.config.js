const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Configure resolver to handle TypeScript files properly
  config.resolver = {
    ...config.resolver,
    sourceExts: ["jsx", "js", "ts", "tsx", "json", "cjs", "mjs"],
    assetExts: [
      "glb",
      "gltf",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "mp4",
      "svg",
      "ttf",
      "otf",
      "woff",
      "woff2",
      "webp",
    ],
  };

  return config;
})();
