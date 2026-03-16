import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { addBankAccount } from "@/_services/banking/bankService";
import { LinearGradient } from "expo-linear-gradient";
import {
  Menu,
  ShieldCheck,
  CreditCard,
  Bitcoin,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  X,
  Clock,
  Wallet,
  Bell,
  Banknote,
  Landmark,
  Check,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/_constants/Colors";
import { useAuth } from "@/_providers/AuthProvider";
import DrawerMenu from "@/_components/DrawerMenu";

import { API_URL } from "@/_constants/apiConfig";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Header from "@/_components/Header";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  isCredit: boolean;
  type: string;
  status: "success" | "pending" | "failed" | "void";
  createdAt: string;
};

const api = {
  baseUrl: API_URL,
};

const WalletScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositMethodModal, setShowDepositMethodModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastDepositAmount, setLastDepositAmount] = useState(0);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankCode: "",
    accountName: "",
  });

  // A single function to refresh all wallet data
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const token = await AsyncStorage.getItem("token");
      // Use the correct endpoint for balance
      const balanceResponse = await fetch(
        `${API_URL}/api/users/${user.id}/balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const balanceData = await balanceResponse.json();

      if (balanceResponse.ok) {
        updateUser({ ...user, walletBalance: balanceData.balance });
      }

      // Fetch transactions separately if needed, or keep existing logic if it works
      const txResponse = await fetch(
        `${API_URL}/api/transactions/user/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const txData = await txResponse.json();

      if (txResponse.ok) {
        setTransactions(txData);
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
      // Alert.alert("Error", "Could not refresh your wallet data.");
    }
  }, [user, updateUser]);

  // useEffect now calls the new refreshData function on screen load
  useEffect(() => {
    refreshData();
  }, []); // Only run once on mount

  // verifyDeposit is now cleaner and uses refreshData
  const verifyDeposit = useCallback(
    async (tx_ref: string, transaction_id: string) => {
      if (!user) return;

      try {
        setIsVerifying(true);
        const verifyResponse = await fetch(`${api.baseUrl}/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transaction_id, userId: user.id }),
        });

        const verifyResult = await verifyResponse.json();
        if (verifyResponse.ok) {
          // 1. Show success animation modal
          setLastDepositAmount(verifyResult.amount || 0);
          setShowSuccessModal(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // 2. Hide modal after 3 seconds
          setTimeout(() => {
            setShowSuccessModal(false);
          }, 3000);

          // 3. Refresh balance and transactions
          refreshData();
        } else {
          Alert.alert("Error", verifyResult.message || "Verification failed.");
        }
      } catch (error) {
        console.error("Flutterwave Verification Error:", error);
        Alert.alert("Error", "An error occurred during verification.");
      } finally {
        setIsVerifying(false);
      }
    },
    [user, refreshData], // Updated dependencies
  );

  // Handle deep linking for deposit verification
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { queryParams } = Linking.parse(event.url);
      if (
        queryParams?.status === "successful" &&
        queryParams?.tx_ref &&
        queryParams?.transaction_id
      ) {
        // Ensure we stay on the wallet screen after redirect
        router.replace("/wallet" as never);
        verifyDeposit(
          queryParams.tx_ref as string,
          queryParams.transaction_id as string,
        );
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [verifyDeposit]);

  // Also handle cold-start deep links (when app is launched by the redirect)
  useEffect(() => {
    const checkInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const { queryParams } = Linking.parse(initialUrl);
          if (
            queryParams?.status === "successful" &&
            queryParams?.tx_ref &&
            queryParams?.transaction_id
          ) {
            router.replace("/wallet" as never);
            verifyDeposit(
              queryParams.tx_ref as string,
              queryParams.transaction_id as string,
            );
          }
        }
      } catch {}
    };
    checkInitialUrl();
  }, [verifyDeposit]);

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (!user || !user.id || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    if (!user.isKYCVerified) {
      Alert.alert(
        "KYC Verification Required",
        "To comply with security regulations, you must complete identity verification before making deposits.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Verify Now",
            onPress: () => {
              setShowDepositModal(false);
              router.push("/verify-kyc" as any);
            },
          },
        ],
      );
      return;
    }

    try {
      setIsInitializing(true);
      const response = await fetch(
        `${api.baseUrl}/api/transactions/initialize-flutterwave`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            amount: numAmount.toString(),
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName,
            redirectUrl: Linking.createURL("wallet"),
          }),
        },
      );

      const result = await response.json();

      if (result.link && typeof result.link === "string") {
        // Clean up link if necessary
        const cleanLink = result.link.trim().replace(/`/g, "");
        setShowDepositModal(false);
        // Reset amount after initiating
        setAmount("");

        const browserResult = await WebBrowser.openBrowserAsync(cleanLink);

        // If the browser is closed, we might want to refresh data just in case
        if (
          browserResult.type === "cancel" ||
          browserResult.type === "dismiss"
        ) {
          // Keep user on wallet after dismissing browser
          router.replace("/wallet" as never);
          refreshData();
        }
      } else {
        Alert.alert(
          "Error",
          result.message || "Could not get a valid payment link.",
        );
      }
    } catch (error) {
      console.error("A critical error occurred in handleDeposit:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please check the console logs.",
      );
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to add a bank account.");
      return;
    }
    try {
      await addBankAccount(bankDetails, user.id);
      setShowAddBankModal(false);
      Alert.alert("Success", "Bank account added successfully.");
    } catch (error) {
      console.error("Failed to add bank account", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not add bank account.",
      );
    }
  };

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!user || !user.id || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    try {
      const response = await fetch(`${api.baseUrl}/api/transactions/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount: numAmount }),
      });
      const result = await response.json();
      if (!response.ok) {
        Alert.alert("Error", result.message || "Withdrawal failed.");
      } else {
        setShowWithdrawModal(false);
        setAmount("");
        await refreshData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Withdrawal request submitted.");
      }
    } catch (e) {
      console.error("Withdraw error:", e);
      Alert.alert("Error", "Could not process withdrawal.");
    }
  };

  return (
    <View style={styles.container}>
      {isVerifying && (
        <View style={styles.verifyingBanner}>
          <ActivityIndicator color={Colors.white} size="small" />
          <Text style={styles.verifyingText}>Verifying payment…</Text>
        </View>
      )}
      <Header title="Wallet" onMenuPress={() => setDrawerOpen(true)} />
      <DrawerMenu visible={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          <Text style={styles.balanceAmount}>
            ₦{(user?.walletBalance ?? 0).toLocaleString()}
          </Text>
          <View style={styles.secureRow}>
            <ShieldCheck size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.secureText}>SECURE CID FINANCIAL NETWORK</Text>
          </View>
        </LinearGradient>

        <View style={styles.depositRow}>
          <TouchableOpacity
            style={styles.depositCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowDepositMethodModal(true);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.depositIcon,
                { backgroundColor: Colors.primaryLight },
              ]}
            >
              <Landmark size={24} color={Colors.primary} />
            </View>
            <Text style={styles.depositLabel}>DEPOSIT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.depositCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowWithdrawModal(true);
            }}
            activeOpacity={0.7}
          >
            <View
              style={[styles.depositIcon, { backgroundColor: Colors.redLight }]}
            >
              <Banknote size={24} color={Colors.red} />
            </View>
            <Text style={styles.depositLabel}>WITHDRAW</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT</Text>
          <TouchableOpacity onPress={() => router.push("/activity" as never)}>
            <Text style={styles.seeAll}>SEE ALL {">"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionList}>
          {transactions.slice(0, 4).map((tx) => {
            const isCredit =
              tx.type.toLowerCase() === "deposit" ||
              tx.type.toLowerCase() === "topup";
            const title = isCredit ? "Deposit" : tx.title;

            const isSuccess =
              tx.status === "success" || tx.status === "completed";
            const isFailed = tx.status === "failed" || tx.status === "void";
            const isPending = tx.status === "pending";

            const statusColor = isSuccess
              ? Colors.primary
              : isFailed
                ? Colors.red
                : isPending
                  ? Colors.accent
                  : Colors.gray;

            const iconBackgroundColor = isSuccess
              ? Colors.primaryLight
              : isFailed
                ? Colors.redLight
                : isPending
                  ? Colors.accentLight
                  : Colors.lightGray;

            const StatusIcon = () => {
              if (isSuccess) return <Check size={12} color={Colors.white} />;
              if (isFailed) return <X size={12} color={Colors.white} />;
              if (isPending) return <Clock size={12} color={Colors.white} />;
              return null;
            };

            return (
              <TouchableOpacity
                key={tx.id}
                style={styles.txCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/receipt",
                    params: {
                      txId: tx.id,
                      fare: tx.amount.toString(),
                      amount: tx.amount.toString(),
                      date: tx.createdAt,
                      status: tx.status,
                      type: isCredit ? "deposit" : tx.type,
                      mode:
                        isCredit &&
                        (typeof tx.title === "string" &&
                        /crypto|bitcoin|usdt|wallet/i.test(tx.title)
                          ? "Cryptocurrency"
                          : "Flutterwave (Bank Transfer)"),
                      pickup: "N/A",
                      destination: tx.title,
                    },
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.txCardLeft}>
                  <View
                    style={[
                      styles.txIcon,
                      { backgroundColor: iconBackgroundColor },
                    ]}
                  >
                    {isPending ? (
                      <Clock size={20} color={statusColor} />
                    ) : isCredit ? (
                      <ArrowDownLeft size={20} color={statusColor} />
                    ) : (
                      <ArrowUpRight size={20} color={statusColor} />
                    )}
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor },
                      ]}
                    >
                      <StatusIcon />
                    </View>
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{title}</Text>
                    <Text style={styles.txDate}>
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.txCardRight}>
                  <Text style={[{ color: statusColor }, styles.txAmount]}>
                    {isCredit ? "+" : "-"}₦{tx.amount.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.txStatus,
                      {
                        color: statusColor,
                        textTransform: "capitalize",
                      },
                    ]}
                  >
                    {tx.status}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Deposit Method Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDepositMethodModal}
        onRequestClose={() => setShowDepositMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.monnifySheet}>
            <View style={styles.monnifyHeader}>
              <View>
                <Text style={styles.monnifyTitle}>Select Method</Text>
                <Text style={styles.monnifySub}>CHOOSE DEPOSIT TYPE</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowDepositMethodModal(false)}
              >
                <X size={20} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.methodRow}>
              <TouchableOpacity
                style={styles.methodBtn}
                onPress={() => {
                  setShowDepositMethodModal(false);
                  setShowDepositModal(true);
                }}
              >
                <View
                  style={[
                    styles.methodIcon,
                    { backgroundColor: Colors.primaryLight },
                  ]}
                >
                  <CreditCard size={24} color={Colors.primary} />
                </View>
                <Text style={styles.methodLabel}>Bank Transfer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.methodBtn}
                onPress={() => {
                  setShowDepositMethodModal(false);
                  router.push("/crypto-deposit" as never);
                }}
              >
                <View
                  style={[
                    styles.methodIcon,
                    { backgroundColor: Colors.accentLight },
                  ]}
                >
                  <Bitcoin size={24} color={Colors.accent} />
                </View>
                <Text style={styles.methodLabel}>Cryptocurrency</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDepositModal}
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.monnifySheet}>
            <View style={styles.monnifyHeader}>
              <View>
                <Text style={styles.monnifyTitle}>Fund Your Wallet</Text>
                <Text style={styles.monnifySub}>VIA FLUTTERWAVE</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowDepositModal(false)}
              >
                <X size={20} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.amountLabel}>ENTER AMOUNT</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="₦0.00"
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={[
                styles.proceedBtn,
                (!amount || isInitializing) && styles.proceedBtnDisabled,
              ]}
              onPress={handleDeposit}
              disabled={!amount || isInitializing}
            >
              {isInitializing ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.proceedBtnText}>Proceed</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showWithdrawModal}
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.monnifySheet}>
            <View style={styles.monnifyHeader}>
              <View>
                <Text style={styles.monnifyTitle}>Withdraw Funds</Text>
                <Text style={styles.monnifySub}>TO YOUR BANK</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowWithdrawModal(false)}
              >
                <X size={20} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.amountLabel}>ENTER AMOUNT</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="₦0.00"
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={[styles.proceedBtn, !amount && styles.proceedBtnDisabled]}
              onPress={handleWithdraw}
              disabled={!amount}
            >
              <Text style={styles.proceedBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Animation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <CheckCircle2 size={60} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Successful!</Text>
            <Text style={styles.successAmount}>
              ₦{lastDepositAmount.toLocaleString()}
            </Text>
            <Text style={styles.successSub}>
              Your deposit has been confirmed and added to your balance.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: "800" as const,
    color: Colors.white,
    marginTop: 8,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  secureText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  },
  depositRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  depositCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    height: 88,
  },
  depositIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  depositLabel: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: Colors.dark,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.gray,
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  transactionList: {
    gap: 12,
    marginTop: 8,
  },
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  txCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  txTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.dark,
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  txCardRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: 16,
    fontWeight: "800" as const,
  },
  txStatus: {
    fontSize: 11,
    fontWeight: "700" as const,
    marginTop: 5,
  },
  statusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModalContent: {
    backgroundColor: Colors.white,
    padding: 40,
    borderRadius: 30,
    alignItems: "center",
    width: "80%",
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.dark,
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.primary,
    marginBottom: 16,
  },
  successSub: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  verifyingBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 100,
  },
  verifyingText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  monnifySheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  monnifyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  monnifyTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.dark,
  },
  monnifySub: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 1,
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.gray,
    letterSpacing: 1,
    marginBottom: 10,
  },
  amountInput: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 14,
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.dark,
    textAlign: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  proceedBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
  },
  proceedBtnDisabled: {
    opacity: 0.5,
  },
  proceedBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  methodRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  methodBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.dark,
    textAlign: "center",
  },
});
