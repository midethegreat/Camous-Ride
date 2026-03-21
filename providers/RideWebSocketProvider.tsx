import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useAuth } from "@/providers/AuthProvider";
import { API_URL } from "@/constants/apiConfig";

// Expo Router will ignore this file
// @expo-router/ignore

interface RideRequest {
  rideId: string;
  pickup: {
    name: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    name: string;
    latitude: number;
    longitude: number;
  };
  passengers: number;
  estimatedFare: number;
  userName: string;
  userPhone: string;
  distance: string;
  estimatedTime: string;
}

interface RideAcceptance {
  rideId: string;
  driverName: string;
  driverPhone: string;
  driverPlate: string;
  verificationCode: string;
}

interface WebSocketContextValue {
  isConnected: boolean;
  pendingRideRequests: RideRequest[];
  acceptRide: (rideId: string) => Promise<void>;
  declineRide: (rideId: string) => Promise<void>;
  currentRide: RideAcceptance | null;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
  pendingRideRequests: [],
  acceptRide: async () => {},
  declineRide: async () => {},
  currentRide: null,
});

interface RideWebSocketProviderProps {
  children: React.ReactNode;
}

export const RideWebSocketProvider: React.FC<RideWebSocketProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [pendingRideRequests, setPendingRideRequests] = useState<RideRequest[]>(
    [],
  );
  const [currentRide, setCurrentRide] = useState<RideAcceptance | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const connectWebSocket = () => {
      try {
        const wsUrl = `${API_URL.replace("http", "ws")}/ws?userId=${user.id}`;
        console.log("Connecting to WebSocket:", wsUrl);

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket connected");
          setIsConnected(true);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("WebSocket message received:", message);

            if (message.type === "ride-request") {
              // Add new ride request to pending list
              setPendingRideRequests((prev) => [...prev, message.data]);
            } else if (message.type === "ride-taken") {
              // Remove ride request if another driver accepted it
              setPendingRideRequests((prev) =>
                prev.filter(
                  (request) => request.rideId !== message.data.rideId,
                ),
              );
            } else if (message.title === "Driver Found!") {
              // Passenger received driver acceptance
              setCurrentRide(message.data);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected");
          setIsConnected(false);
          wsRef.current = null;

          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect WebSocket...");
            connectWebSocket();
          }, 5000);
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.id]);

  const acceptRide = async (rideId: string) => {
    try {
      const response = await fetch(`${API_URL}/rides/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId,
          driverId: user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Remove from pending requests
        setPendingRideRequests((prev) =>
          prev.filter((request) => request.rideId !== rideId),
        );
        console.log("Ride accepted successfully:", data);
      } else {
        console.error("Failed to accept ride:", response.statusText);
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
    }
  };

  const declineRide = async (rideId: string) => {
    // Simply remove from pending requests
    setPendingRideRequests((prev) =>
      prev.filter((request) => request.rideId !== rideId),
    );
    console.log("Ride declined:", rideId);
  };

  const value: WebSocketContextValue = {
    isConnected,
    pendingRideRequests,
    acceptRide,
    declineRide,
    currentRide,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useRideWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useRideWebSocket must be used within a RideWebSocketProvider",
    );
  }
  return context;
};
