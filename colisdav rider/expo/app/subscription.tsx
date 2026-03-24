import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  CheckCircle2,
  Crown,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { SUBSCRIPTION_TIERS } from "@/constants/subscriptions";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentTier = user?.subscription?.type || "free";

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      // Simulate payment process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const plan = Object.values(SUBSCRIPTION_TIERS).find((p) => p.id === planId);
      if (!plan) throw new Error("Invalid plan");

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (plan.durationDays || 0));

      await updateProfile({
        subscription: {
          type: "premium",
          planId: plan.id.includes("weekly") ? "weekly" : "monthly",
          expiryDate: expiryDate.toISOString(),
          commissionRate: plan.commissionRate,
          priority: plan.priority,
        },
      });

      Alert.alert(
        "Subscription Successful",
        `You are now a ${plan.name} driver! Enjoy lower commissions and priority matching.`,
        [{ text: "Great!", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlanCard = (plan: any) => {
    const isCurrent = currentTier === "free" ? plan.id === "free" : user?.subscription?.planId === plan.id.split("_")[1];
    const isPremium = plan.id !== "free";

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          selectedPlan === plan.id && styles.selectedPlanCard,
          isCurrent && styles.currentPlanCard,
        ]}
        onPress={() => !isCurrent && setSelectedPlan(plan.id)}
        disabled={isCurrent}
      >
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              {plan.fee === 0 ? "Free" : `₦${plan.fee.toLocaleString()}`}
              {plan.durationDays ? ` / ${plan.durationDays} days` : ""}
            </Text>
          </View>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>

        <View style={styles.benefitsList}>
          {plan.benefits.map((benefit: string, index: number) => (
            <View key={index} style={styles.benefitItem}>
              <CheckCircle2 size={16} color={Colors.success} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {!isCurrent && isPremium && (
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => handleUpgrade(plan.id)}
            disabled={isLoading}
          >
            {isLoading && selectedPlan === plan.id ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.subscribeButtonText}>Upgrade Now</Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Crown size={48} color={Colors.warning} style={styles.heroIcon} />
          <Text style={styles.heroTitle}>Maximize Your Earnings</Text>
          <Text style={styles.heroSubtitle}>
            Choose a premium plan to get lower commissions and priority ride matching.
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {Object.values(SUBSCRIPTION_TIERS).map((plan) => renderPlanCard(plan))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Go Premium?</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Zap size={24} color={Colors.primary} />
              <Text style={styles.infoCardTitle}>Priority Matching</Text>
              <Text style={styles.infoCardText}>Get matched with riders faster than others.</Text>
            </View>
            <View style={styles.infoCard}>
              <TrendingUp size={24} color={Colors.success} />
              <Text style={styles.infoCardTitle}>Lower Fees</Text>
              <Text style={styles.infoCardText}>Keep up to 97% of your earnings.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    padding: 30,
    backgroundColor: Colors.backgroundCard,
  },
  heroIcon: {
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  plansContainer: {
    padding: 20,
    gap: 20,
  },
  planCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  selectedPlanCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "05",
  },
  currentPlanCard: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "05",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  benefitsList: {
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text,
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  infoSection: {
    padding: 20,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 15,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 16,
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  infoCardText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
