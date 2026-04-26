#!/usr/bin/env node

/**
 * Custom Metro startup script that bypasses network dependency validation
 * to prevent "Body is unusable: Body has already been read" errors
 */

const { spawn } = require("child_process");
const path = require("path");

// Set environment variable to skip dependency validation
process.env.EXPO_SKIP_DEPENDENCY_VALIDATION = "true";
process.env.EXPO_NO_NATIVE_MODULES = "true";

// Start Metro with network enabled but skip problematic validation
const metroProcess = spawn(
  "npx",
  ["expo", "start", "--clear", "--port", "8082"],
  {
    stdio: "inherit",
    shell: true,
    cwd: __dirname,
    env: {
      ...process.env,
      EXPO_SKIP_DEPENDENCY_VALIDATION: "true",
      EXPO_NO_NATIVE_MODULES: "true",
      NODE_OPTIONS: "--max-old-space-size=4096",
    },
  },
);

metroProcess.on("error", (error) => {
  console.error("Failed to start Metro:", error);
  process.exit(1);
});

metroProcess.on("exit", (code) => {
  process.exit(code);
});
