import { Platform } from "react-native";
import Constants from "expo-constants";

const resolveHost = () => {
  // 1) Web: use the browser origin host if available
  try {
    if (typeof window !== "undefined" && window.location?.hostname) {
      const host = window.location.hostname;
      if (host) return host;
    }
  } catch {}

  // 2) Expo: derive from dev host (Metro)
  const hostUri =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest?.hostUri ||
    "";
  if (typeof hostUri === "string" && hostUri.length > 0) {
    const host = hostUri.split(":")[0];
    if (host && host !== "localhost") return host;
  }

  // 3) Optional explicit override via app.json extra.apiHost
  const extra: any =
    (Constants?.expoConfig && (Constants.expoConfig as any).extra) ||
    (Constants as any)?.manifest?.extra ||
    {};
  if (extra?.apiHost) return extra.apiHost;

  // 4) MANUAL OVERRIDE (IMPORTANT: Change this to your computer's IP address if connection fails)
  // To find your IP: Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) in terminal.
  // Look for IPv4 Address (e.g., 192.168.x.x)
  // return "192.168.0.128"; // Set your IP here if auto-detection is wrong
  
  // 5) Emulator/device sensible defaults
  if (Platform.OS === "android") return "10.0.2.2"; // Android emulator -> host loopback
  return "127.0.0.1"; // iOS simulator / fallback
};

export const API_URL = `http://${resolveHost()}:3000`;
console.log(`[API] Base URL configured as: ${API_URL}`);

// @expo-router/ignore
