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

  // 5) Manual override for local network
  return "192.168.0.121";
};

export const API_URL = `http://${resolveHost()}:3000`;
console.log(`[API] Base URL configured as: ${API_URL}`);