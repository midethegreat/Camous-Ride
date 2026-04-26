export interface AIRequest {
  type:
    | "route_optimization"
    | "demand_prediction"
    | "anomaly_detection"
    | "sentiment_analysis"
    | "recommendation"
    | "support_chat";
  data: any;
  userId?: string;
  context?: string;
}

export interface AIResponse {
  success: boolean;
  data: any;
  message?: string;
  confidence?: number;
}

export class AIService {
  private static instance: AIService;
  private apiEndpoint = "/api/ai";

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      // Simulate AI processing with realistic delays
      await this.simulateProcessing(request.type);

      switch (request.type) {
        case "route_optimization":
          return this.optimizeRoute(request.data);
        case "demand_prediction":
          return this.predictDemand(request.data);
        case "anomaly_detection":
          return this.detectAnomalies(request.data);
        case "sentiment_analysis":
          return this.analyzeSentiment(request.data);
        case "recommendation":
          return this.generateRecommendations(request.data);
        case "support_chat":
          return this.getSupportResponse(request.data);
        default:
          throw new Error("Unknown AI request type");
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "AI processing failed",
      };
    }
  }

  private async simulateProcessing(type: string): Promise<void> {
    const delays = {
      route_optimization: 800,
      demand_prediction: 600,
      anomaly_detection: 400,
      sentiment_analysis: 300,
      recommendation: 500,
    };

    await new Promise((resolve) => setTimeout(resolve, delays[type] || 500));
  }

  private optimizeRoute(data: any): AIResponse {
    const { pickup, destination, waypoints = [], traffic = "normal" } = data;

    // Simulate route optimization
    const optimizedRoute = {
      distance: Math.random() * 5 + 2, // 2-7 km
      duration: Math.random() * 20 + 10, // 10-30 minutes
      fuel_efficiency: Math.random() * 0.3 + 0.7, // 70-100%
      traffic_density: Math.random() * 0.5 + 0.3, // 30-80%
      alternative_routes: [
        { name: "Route A", distance: 3.2, duration: 15, traffic: "light" },
        { name: "Route B", distance: 4.1, duration: 18, traffic: "normal" },
        { name: "Route C", distance: 2.8, duration: 22, traffic: "heavy" },
      ],
    };

    return {
      success: true,
      data: optimizedRoute,
      confidence: 0.85,
      message: "Route optimized successfully",
    };
  }

  private predictDemand(data: any): AIResponse {
    const { location, timeOfDay, dayOfWeek, weather = "clear" } = data;

    // Simulate demand prediction based on historical patterns
    const baseDemand = Math.random() * 0.8 + 0.2; // 20-100%
    const timeMultiplier = this.getTimeMultiplier(timeOfDay);
    const dayMultiplier = this.getDayMultiplier(dayOfWeek);
    const weatherMultiplier = this.getWeatherMultiplier(weather);

    const predictedDemand =
      baseDemand * timeMultiplier * dayMultiplier * weatherMultiplier;

    return {
      success: true,
      data: {
        demand_level: Math.min(predictedDemand, 1.0),
        peak_hours: ["08:00-10:00", "17:00-19:00", "21:00-23:00"],
        surge_multiplier: Math.max(1.0, predictedDemand * 1.5),
        recommended_drivers: Math.ceil(predictedDemand * 10),
      },
      confidence: 0.78,
      message: "Demand prediction completed",
    };
  }

  private detectAnomalies(data: any): AIResponse {
    const { transactions, user_behavior, location_data } = data;

    // Simulate anomaly detection
    const anomalies = [
      {
        type: "unusual_location",
        severity: "medium",
        description: "Transaction from unusual location",
        confidence: 0.72,
      },
      {
        type: "rapid_transactions",
        severity: "low",
        description: "Multiple transactions in short time",
        confidence: 0.45,
      },
    ].filter(() => Math.random() > 0.7); // 30% chance of anomalies

    return {
      success: true,
      data: {
        anomalies: anomalies,
        risk_score: Math.random() * 0.3 + 0.1, // 10-40% risk
        recommendations: ["Monitor account activity", "Verify user identity"],
      },
      confidence: 0.82,
      message: "Anomaly detection completed",
    };
  }

  private analyzeSentiment(data: any): AIResponse {
    const { text, context = "general" } = data;

    // Simulate sentiment analysis
    const sentiments = ["positive", "negative", "neutral"];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const confidence = Math.random() * 0.4 + 0.6; // 60-100%

    const emotions = {
      positive: ["happy", "satisfied", "excited"],
      negative: ["frustrated", "disappointed", "angry"],
      neutral: ["indifferent", "calm", "objective"],
    };

    return {
      success: true,
      data: {
        sentiment: sentiment,
        confidence: confidence,
        emotion:
          emotions[sentiment][
            Math.floor(Math.random() * emotions[sentiment].length)
          ],
        key_phrases: ["great service", "quick delivery", "friendly driver"],
      },
      confidence: confidence,
      message: "Sentiment analysis completed",
    };
  }

  private generateRecommendations(data: any): AIResponse {
    const { user_profile, history, preferences } = data;

    // Simulate personalized recommendations
    const recommendations = [
      {
        type: "restaurant",
        name: "Local Cafe",
        reason: "Based on your previous orders",
        confidence: 0.75,
      },
      {
        type: "route",
        name: "Express Lane",
        reason: "Faster delivery option",
        confidence: 0.68,
      },
      {
        type: "promotion",
        name: "20% Off Next Order",
        reason: "Loyalty reward",
        confidence: 0.82,
      },
    ].filter(() => Math.random() > 0.3); // 70% chance of recommendations

    return {
      success: true,
      data: {
        recommendations: recommendations,
        personalization_score: Math.random() * 0.3 + 0.7, // 70-100%
        next_best_action: "Try our new express delivery option",
      },
      confidence: 0.79,
      message: "Recommendations generated successfully",
    };
  }

  private getTimeMultiplier(timeOfDay: string): number {
    const hour = parseInt(timeOfDay.split(":")[0]);
    if (hour >= 8 && hour <= 10) return 1.5; // Morning peak
    if (hour >= 17 && hour <= 19) return 1.8; // Evening peak
    if (hour >= 22 || hour <= 5) return 0.6; // Night
    return 1.0;
  }

  private getDayMultiplier(dayOfWeek: string): number {
    const weekends = ["Saturday", "Sunday"];
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    if (weekends.includes(dayOfWeek)) return 1.3;
    if (weekdays.includes(dayOfWeek)) return 1.0;
    return 0.8;
  }

  private getWeatherMultiplier(weather: string): number {
    const multipliers = {
      clear: 1.0,
      cloudy: 0.9,
      rainy: 1.4,
      stormy: 1.6,
      snowy: 1.8,
    };
    return multipliers[weather] || 1.0;
  }

  private getSupportResponse(data: any): AIResponse {
    const { text } = data;
    const query = text.toLowerCase();

    // Intent: Ride Booking
    if (
      query.includes("book") ||
      query.includes("ride") ||
      query.includes("keke") ||
      query.includes("trip") ||
      query.includes("find") ||
      query.includes("pick")
    ) {
      if (query.includes("price") || query.includes("cost") || query.includes("how much")) {
        return {
          success: true,
          data: {
            response: "Ride fares start from ₦200 for standard campus trips. Premium rides may cost more depending on the distance and demand. You'll see the exact price before confirming your booking.",
            suggestions: ["Book a ride now", "What is premium ride?", "Wallet balance"]
          },
          confidence: 0.98
        };
      }
      return {
        success: true,
        data: {
          response:
            "To book a ride, go to the Home screen, select your pickup and destination locations, and tap 'Find Ride'. You can also choose between regular and premium rides.",
          suggestions: ["How much is a ride?", "Book a ride now", "Ride history"],
        },
        confidence: 0.95,
      };
    }

    // Intent: Wallet/Payments
    if (
      query.includes("wallet") ||
      query.includes("pay") ||
      query.includes("fund") ||
      query.includes("balance") ||
      query.includes("money") ||
      query.includes("naira") ||
      query.includes("transfer")
    ) {
      if (query.includes("balance")) {
        return {
          success: true,
          data: {
            response: "You can check your balance at the top of the Wallet screen. If your balance isn't updating, please pull down to refresh the page.",
            suggestions: ["Fund wallet", "Transaction history", "Payment methods"]
          },
          confidence: 0.96
        };
      }
      return {
        success: true,
        data: {
          response:
            "You can manage your funds in the Wallet section. To fund your wallet, go to 'Wallet' and select 'Fund Account'. We support bank transfers, cards, and crypto payments.",
          suggestions: ["Check balance", "Fund wallet", "Transaction history"],
        },
        confidence: 0.92,
      };
    }

    // Intent: Delivery
    if (
      query.includes("deliver") ||
      query.includes("order") ||
      query.includes("food") ||
      query.includes("package") ||
      query.includes("restaurant") ||
      query.includes("vendor")
    ) {
      if (query.includes("track") || query.includes("where is")) {
        return {
          success: true,
          data: {
            response: "To track your delivery, go to the 'Deliveries' tab and click on your active order. You'll see the rider's live location on the map.",
            suggestions: ["Call rider", "Delivery time", "Order details"]
          },
          confidence: 0.97
        };
      }
      return {
        success: true,
        data: {
          response:
            "For deliveries, visit the 'Deliveries' tab. You can track your active orders in real-time or place a new order from our registered campus vendors.",
          suggestions: ["Track my order", "New delivery", "Vendor list"],
        },
        confidence: 0.9,
      };
    }

    // Intent: Safety/Reporting
    if (
      query.includes("safe") ||
      query.includes("danger") ||
      query.includes("report") ||
      query.includes("lost") ||
      query.includes("emergency") ||
      query.includes("problem")
    ) {
      return {
        success: true,
        data: {
          response: "Your safety is our priority. If you're in an emergency, use the 'SOS' button in the ride screen. To report a lost item or a problem with a rider, please select 'Report a Problem' and I'll connect you with our security team.",
          suggestions: ["Talk to agent", "Emergency contacts", "Safety tips"]
        },
        confidence: 0.99
      };
    }

    // Intent: Profile/Account
    if (
      query.includes("profile") ||
      query.includes("account") ||
      query.includes("kyc") ||
      query.includes("verify") ||
      query.includes("change") ||
      query.includes("identity")
    ) {
      return {
        success: true,
        data: {
          response:
            "You can update your personal info and KYC status in the 'Profile' section. Ensure your ID card is clearly visible for faster verification. Verification usually takes 2-4 hours.",
          suggestions: ["Update profile", "KYC status", "Change password"],
        },
        confidence: 0.88,
      };
    }

    // Intent: Help/Human Agent
    if (
      query.includes("agent") ||
      query.includes("human") ||
      query.includes("talk to") ||
      query.includes("support") ||
      query.includes("help")
    ) {
      return {
        success: true,
        data: {
          response:
            "I'm here to help! If I can't solve your issue, I can redirect you to a human support agent. Would you like me to do that now?",
          suggestions: ["Talk to agent", "Report a problem", "FAQs"],
        },
        confidence: 0.98,
      };
    }

    // Default Fallback
    return {
      success: true,
      data: {
        response:
          "I'm not quite sure I understand. Could you please rephrase that? I can help with ride bookings, deliveries, wallet funding, or account issues.",
        suggestions: [
          "How to book a ride?",
          "Fund my wallet",
          "Talk to an agent",
        ],
      },
      confidence: 0.5,
    };
  }
}

export default AIService;
