import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  ShieldCheck,
  Search,
  X,
  Trash,
  ArrowLeft,
  Banknote,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";

import { API_URL } from "@/constants/apiConfig";

const Colors = {
  background: "#F3F4F6",
  white: "#FFFFFF",
  dark: "#1A1A1A",
  primary: "#0261ef",
  gray: "#8E8E93",
  lightGray: "#AEAEB2",
  red: "#FF3B30",
  redLight: "rgba(255, 59, 48, 0.1)",
  green: "#34C759",
  greenLight: "rgba(52, 199, 89, 0.1)",
  border: "#E5E5EA",
  light: "#FFFFFF",
  primaryMuted: "rgba(2, 97, 239, 0.1)",
};

const Bank = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
  const [allBanks, setAllBanks] = useState<any[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);

  // Clear verification when inputs change
  useEffect(() => {
    setVerifiedAccountName("");
  }, [accountNumber, selectedBank]);

  const filteredBanks = useMemo(() => {
    if (!searchQuery) {
      return allBanks;
    }
    return allBanks.filter((bank) =>
      bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, allBanks]);

  useEffect(() => {
    const fetchBankList = async () => {
      try {
        const response = await fetch(`${API_URL}/api/bank/list`);
        if (response.ok) {
          const data = await response.json();
          setAllBanks(data);
        } else {
          const errorText = await response.text();
          console.error(
            "Failed to fetch bank list:",
            response.status,
            errorText,
          );
          Alert.alert(
            "Error",
            `Could not load the list of banks. Server responded with: ${errorText}`,
          );
        }
      } catch (error) {
        console.error("Error fetching bank list:", error);
        Alert.alert(
          "Error",
          "An unexpected error occurred while loading banks. Please check your connection.",
        );
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBankList();
  }, []);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const userId = user?.id;

        if (!userId) {
          console.error(
            "User ID is not available, cannot fetch bank accounts.",
          );
          return;
        }

        const response = await fetch(`${API_URL}/api/bank/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setSavedAccounts(data);
        } else {
          const errorText = await response.text();
          console.error(
            "Failed to fetch bank accounts:",
            response.status,
            errorText,
          );
        }
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
      }
    };

    fetchBankAccounts();
  }, [user]);

  const handleVerifyAccount = async () => {
    if (!selectedBank || !accountNumber) {
      Alert.alert("Error", "Please select a bank and enter an account number.");
      return;
    }
    setIsVerifying(true);
    setVerifiedAccountName("");
    try {
      const response = await fetch(`${API_URL}/api/bank/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber,
          bankCode: selectedBank.code,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setVerifiedAccountName(data.account_name);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (error) {
      Alert.alert(
        "Verification Error",
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddAccount = async () => {
    if (!verifiedAccountName || !selectedBank || !accountNumber) {
      Alert.alert("Error", "Please verify account details before adding.");
      return;
    }

    if (!user?.isKYCVerified) {
      Alert.alert(
        "KYC Verification Required",
        "You must complete identity verification before adding a bank account.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Verify Now",
            onPress: () => router.push("/verify-kyc" as any),
          },
        ],
      );
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`${API_URL}/api/bank/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          bankName: selectedBank.name,
          accountNumber,
          accountName: verifiedAccountName,
          bankCode: selectedBank.code,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Bank account added successfully.");
        setSavedAccounts((prev) => [...prev, data.account]);
        setAccountNumber("");
        setSelectedBank(null);
        setVerifiedAccountName("");
      } else {
        throw new Error(data.message || "Failed to add account");
      }
    } catch (error) {
      Alert.alert(
        "Add Account Error",
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this bank account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/api/bank/delete/${accountId}`,
                {
                  method: "DELETE",
                },
              );
              if (response.ok) {
                Alert.alert("Success", "Account deleted successfully.");
                setSavedAccounts((prev) =>
                  prev.filter((acc) => acc.id !== accountId),
                );
              } else {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete account");
              }
            } catch (error) {
              Alert.alert(
                "Delete Error",
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top, paddingBottom: 0 }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Accounts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {savedAccounts.length === 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Account</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={selectedBank ? styles.inputText : styles.placeholder}
              >
                {selectedBank ? selectedBank.name : "Select Bank"}
              </Text>
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputText}
                placeholder="Account Number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            {accountNumber.length === 10 &&
              !verifiedAccountName &&
              !isVerifying && (
                <TouchableOpacity
                  style={styles.verifyBtn}
                  onPress={handleVerifyAccount}
                >
                  <Text style={styles.verifyBtnText}>Verify Account</Text>
                </TouchableOpacity>
              )}

            {isVerifying && (
              <View style={styles.verifyingContainer}>
                <ActivityIndicator color={Colors.primary} size="small" />
                <Text style={styles.verifyingText}>Verifying...</Text>
              </View>
            )}
            {verifiedAccountName && (
              <View style={styles.verifiedContainer}>
                <ShieldCheck size={16} color={Colors.green} />
                <Text style={styles.verifiedText}>{verifiedAccountName}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                (!verifiedAccountName || isAdding) && styles.buttonDisabled,
              ]}
              onPress={handleAddAccount}
              disabled={!verifiedAccountName || isAdding}
            >
              {isAdding ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Add Account</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.limitReachedContainer}>
              <ShieldCheck size={20} color={Colors.primary} />
              <Text style={styles.limitReachedText}>
                You have reached the maximum limit of 1 bank account. Remove the
                existing one to add a new account.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Accounts</Text>
          {savedAccounts.length > 0 ? (
            savedAccounts.map((account) => (
              <View key={account.id} style={styles.savedAccountCard}>
                <View style={styles.bankIconContainer}>
                  <Banknote size={24} color={Colors.primary} />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{account.accountName}</Text>
                  <Text style={styles.accountInfo}>
                    {account.bankName} - {account.accountNumber}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteAccount(account.id)}
                >
                  <Trash size={20} color={Colors.red} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No saved accounts yet.</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Bank</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a bank"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {isLoadingBanks ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={filteredBanks}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => {
                    setSelectedBank(item);
                    setModalVisible(false);
                    setSearchQuery("");
                  }}
                >
                  <Text style={styles.bankName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.gray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 12,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    color: Colors.dark,
  },
  placeholder: {
    fontSize: 16,
    color: Colors.gray,
  },
  verifyBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  verifyBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  verifyingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  verifyingText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  verifiedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.greenLight,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  verifiedText: {
    marginLeft: 8,
    color: Colors.green,
    fontWeight: "500",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.primaryMuted,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  savedAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark,
  },
  accountInfo: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.gray,
    paddingVertical: 20,
  },
  limitReachedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryMuted,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  limitReachedText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  bankItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bankName: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },
});

export default Bank;
