import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AIService, { AIRequest, AIResponse } from "../services/aiService";

export interface UseAIOptions {
  autoProcess?: boolean;
  debounceMs?: number;
  cacheKey?: string;
}

export interface UseAIResult {
  data: any;
  loading: boolean;
  error: string | null;
  confidence: number | null;
  process: (request: AIRequest) => Promise<void>;
  clear: () => void;
}

export function useAI(
  type: AIRequest["type"],
  options: UseAIOptions = {},
): UseAIResult {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const aiService = AIService.getInstance();
  const { autoProcess = false, debounceMs = 300, cacheKey } = options;

  const process = useCallback(
    async (request: AIRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await aiService.processRequest(request);

        if (response.success) {
          setData(response.data);
          setConfidence(response.confidence || null);

          // Cache the result if cacheKey is provided
          if (cacheKey) {
            await AsyncStorage.setItem(
              `ai_cache_${cacheKey}`,
              JSON.stringify({
                data: response.data,
                confidence: response.confidence,
                timestamp: Date.now(),
              }),
            );
          }
        } else {
          setError(response.message || "AI processing failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    },
    [aiService, cacheKey],
  );

  const clear = useCallback(async () => {
    setData(null);
    setError(null);
    setConfidence(null);
    setLoading(false);

    if (cacheKey) {
      await AsyncStorage.removeItem(`ai_cache_${cacheKey}`);
    }
  }, [cacheKey]);

  // Load cached data on mount
  useEffect(() => {
    const loadCache = async () => {
      if (cacheKey) {
        try {
          const cached = await AsyncStorage.getItem(`ai_cache_${cacheKey}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            // Check if cache is less than 5 minutes old
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              setData(parsed.data);
              setConfidence(parsed.confidence);
            }
          }
        } catch (e) {
          // Invalid cache, ignore
        }
      }
    };

    loadCache();
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    confidence,
    process,
    clear,
  };
}

// Specialized AI hooks for common use cases
export function useRouteOptimization(
  pickup: any,
  destination: any,
  options: UseAIOptions = {},
) {
  const { data, loading, error, confidence, process, clear } = useAI(
    "route_optimization",
    options,
  );

  const optimizeRoute = useCallback(() => {
    if (!pickup || !destination) return;

    process({
      type: "route_optimization",
      data: { pickup, destination, waypoints: [], traffic: "normal" },
    });
  }, [pickup, destination, process]);

  return {
    optimizedRoute: data,
    loading,
    error,
    confidence,
    optimizeRoute,
    clear,
  };
}

export function useDemandPrediction(
  location: any,
  timeOfDay: string,
  options: UseAIOptions = {},
) {
  const { data, loading, error, confidence, process, clear } = useAI(
    "demand_prediction",
    options,
  );

  const predictDemand = useCallback(() => {
    if (!location || !timeOfDay) return;

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeek = days[new Date().getDay()];

    process({
      type: "demand_prediction",
      data: { location, timeOfDay, dayOfWeek, weather: "clear" },
    });
  }, [location, timeOfDay, process]);

  return {
    demandPrediction: data,
    loading,
    error,
    confidence,
    predictDemand,
    clear,
  };
}

export function useAnomalyDetection(
  transactions: any[],
  options: UseAIOptions = {},
) {
  const { data, loading, error, confidence, process, clear } = useAI(
    "anomaly_detection",
    options,
  );

  const detectAnomalies = useCallback(() => {
    if (!transactions || transactions.length === 0) return;

    process({
      type: "anomaly_detection",
      data: { transactions, user_behavior: {}, location_data: {} },
    });
  }, [transactions, process]);

  return {
    anomalies: data?.anomalies || [],
    riskScore: data?.risk_score || 0,
    loading,
    error,
    confidence,
    detectAnomalies,
    clear,
  };
}

export function useSentimentAnalysis(text: string, options: UseAIOptions = {}) {
  const { data, loading, error, confidence, process, clear } = useAI(
    "sentiment_analysis",
    options,
  );

  const analyzeSentiment = useCallback(() => {
    if (!text || text.trim().length === 0) return;

    process({
      type: "sentiment_analysis",
      data: { text, context: "customer_feedback" },
    });
  }, [text, process]);

  return {
    sentiment: data,
    loading,
    error,
    confidence,
    analyzeSentiment,
    clear,
  };
}

export function useRecommendations(
  userProfile: any,
  history: any[],
  options: UseAIOptions = {},
) {
  const { data, loading, error, confidence, process, clear } = useAI(
    "recommendation",
    options,
  );

  const generateRecommendations = useCallback(() => {
    if (!userProfile) return;

    process({
      type: "recommendation",
      data: {
        user_profile: userProfile,
        history: history || [],
        preferences: {},
      },
    });
  }, [userProfile, history, process]);

  return {
    recommendations: data?.recommendations || [],
    personalizationScore: data?.personalization_score || 0,
    loading,
    error,
    confidence,
    generateRecommendations,
    clear,
  };
}
