import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import Colors from "@/constants/Colors";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={48} color={Colors.red} />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred. Please try again or restart the app.
            </Text>
            {process.env.NODE_ENV === "development" && (
              <Text style={styles.errorText}>{this.state.error?.message}</Text>
            )}
            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <RefreshCw size={20} color={Colors.white} />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    elevation: 8,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 12,
    color: Colors.red,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: "100%",
  },
  button: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ErrorBoundary;
