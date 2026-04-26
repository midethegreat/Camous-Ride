---
name: "metro-troubleshooting"
description: "Fixes Metro bundler 500 errors and cache issues. Invoke when user gets Metro bundler errors like 'Cannot read properties of undefined (reading get)'."
---

# Metro Bundler Troubleshooting

This skill helps resolve common Metro bundler errors in React Native/Expo projects, particularly the "Cannot read properties of undefined (reading 'get')" error.

## Common Solutions

### 1. Clear Metro Cache (First Try)

```bash
npx expo start --clear
```

### 2. Complete Cache Reset

```bash
# Stop dev server first
# Then run:
rm -rf node_modules
rm -rf .expo
rm -rf metro-cache
rm package-lock.json
npm install
npx expo start --clear
```

### 3. Check Metro Configuration

Update metro.config.js to handle the undefined map issue:

```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add resolver settings to prevent undefined map errors
config.resolver = {
  ...config.resolver,
  sourceExts: ["jsx", "js", "ts", "tsx", "json"],
  assetExts: ["glb", "gltf", "png", "jpg", "gif", "mp4", "svg"],
  unstable_enablePackageExports: false,
  unstable_conditionNames: ["require", "import"],
};

module.exports = config;
```

### 4. Fix Dependency Version Conflicts

Check for Expo version mismatches between different apps in the same project:

- Ensure all apps use compatible Expo versions
- Update vendor-dashboard package.json to match main app versions

### 5. Patch Metro Dependency (Last Resort)

If the error persists, create a patch for the Metro dependency:

```javascript
// In node_modules/metro/src/node-haste/DependencyGraph.js
function getOrCreateMap(map, field) {
  if (!map) return new Map(); // Add null check
  let subMap = map.get(field);
  if (!subMap) {
    subMap = new Map();
    map.set(field, subMap);
  }
  return subMap;
}
```

## When to Use This Skill

Invoke this skill when:

- User reports Metro bundler 500 errors
- Development server fails with "Cannot read properties of undefined"
- Metro cache corruption is suspected
- Dependency conflicts between Expo versions exist
