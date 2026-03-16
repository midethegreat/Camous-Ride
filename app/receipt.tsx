import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Share2, Download, CheckCircle, Printer } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DepositReceipt from "@/_components/DepositReceipt";
import Colors from "@/_constants/Colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPrinting, setIsPrinting] = useState(true);
  const printAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Printing animation
    Animated.sequence([
      Animated.timing(printAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.delay(500),
    ]).start(() => {
      setIsPrinting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, []);

  const receiptTranslateY = printAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const params = useLocalSearchParams<{
    txId: string;
    fare: string;
    tip?: string;
    pickup: string;
    destination: string;
    date: string;
    status: string;
    type?: string;
  }>();

  if (params.type === "deposit") {
    return <DepositReceipt route={{ params }} />;
  }

  const isVoided = params.status === "cancelled";
  const fare = parseInt(params.fare ?? "200", 10);
  const tipAmount = parseInt(params.tip ?? "0", 10);
  const totalBill = fare + tipAmount;
  const txId = params.txId ?? "TX-103";
  const pickupName = params.pickup ?? "Senate Building";
  const destName = params.destination ?? "Library Junction";
  const dateStr = params.date ?? "Oct 23, 09:10 AM";

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const message = [
        `CID Receipt - ${txId}`,
        `Date: ${dateStr}`,
        `From: ${pickupName}`,
        `To: ${destName}`,
        `Fare: ₦${fare}`,
        `Tip: ₦${tipAmount}`,
        `Total: ₦${totalBill}`,
        isVoided ? "(VOIDED)" : "PAID",
      ].join("\n");
      await Share.share({ message });
    } catch (error) {
      console.log("Share error:", error);
      Alert.alert("Error", "Could not share receipt. Please try again.");
    }
  };

  const handleDownload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Not Available",
      "Saving receipt image is not available in Expo Go.",
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>E-RECEIPT</Text>
        {isPrinting ? (
          <View style={styles.printingRow}>
            <Printer size={16} color={Colors.primary} />
            <Text style={styles.printingText}>PRINTING...</Text>
          </View>
        ) : (
          <View style={styles.doneRow}>
            <View
              style={[
                styles.doneDot,
                { backgroundColor: isVoided ? Colors.red : Colors.green },
              ]}
            />
            <Text
              style={[
                styles.doneText,
                { color: isVoided ? Colors.red : Colors.green },
              ]}
            >
              {isVoided ? "VOIDED" : "PAID"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.receiptContainer}>
        <Animated.View 
          style={[
            styles.receiptShot, 
            { transform: [{ translateY: receiptTranslateY }] }
          ]}
        >
          <View style={styles.receiptCard}>
            <View style={styles.tearEdge}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={styles.tearTriangle} />
              ))}
            </View>

            <View style={styles.receiptInner}>
              <View style={styles.checkCircle}>
                <CheckCircle
                  size={32}
                  color={isVoided ? Colors.red : Colors.primary}
                />
              </View>

              <Text style={styles.brand}>CID NIGERIA</Text>
              <Text style={styles.partnerLabel}>VERIFIED CAMPUS PARTNER</Text>
              <Text style={styles.campus}>FUNAAB</Text>

              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{dateStr}</Text>
                <Text style={styles.txId}>{txId}</Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.billingLabel}>BILLING DETAILS</Text>

              <View style={styles.billingRow}>
                <View>
                  <Text style={styles.billingTitle}>CAMPUS COMMUTE</Text>
                  <Text style={styles.billingRoute}>{pickupName}</Text>
                  <Text style={styles.billingRouteTo}>→ {destName}</Text>
                </View>
                <Text style={styles.billingAmount}>₦{fare}</Text>
              </View>

              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>TIP</Text>
                <Text style={styles.feeValue}>₦{tipAmount}</Text>
              </View>

              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>SERVICE FEE</Text>
                <Text style={styles.feeValue}>₦0</Text>
              </View>

              <View style={styles.dashedLine} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL BILL</Text>
                <View style={styles.totalRight}>
                  <Text
                    style={[
                      styles.totalAmount,
                      isVoided && styles.voidedAmount,
                    ]}
                  >
                    ₦{totalBill}
                  </Text>
                  {isVoided && (
                    <Text style={styles.voidedLabel}>TRANSACTION VOIDED</Text>
                  )}
                </View>
              </View>

              <View style={styles.dashedLine} />

              <View style={styles.qrContainer}>
                <QRCode
                  value={`TXID:${txId}`}
                  size={100}
                  backgroundColor="white"
                  color="black"
                  logo={require("../assets/images/icon.png")}
                  logoSize={20}
                  logoBackgroundColor="transparent"
                />
                <Text style={styles.scanText}>Scan to verify</Text>
              </View>
            </View>

            <View style={styles.tearEdgeBottom}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={styles.tearTriangleBottom} />
              ))}
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDownload}
            activeOpacity={0.85}
          >
            <Download size={20} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Share2 size={20} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: Colors.dark,
    letterSpacing: 1,
  },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  doneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  doneText: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  printingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  printingText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  receiptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  receiptShot: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
    alignSelf: "center",
  },
  receiptCard: {
    backgroundColor: "transparent",
  },
  tearEdge: {
    flexDirection: "row",
    height: 10,
    overflow: "hidden",
  },
  tearTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#F0F2F5",
  },
  tearEdgeBottom: {
    flexDirection: "row",
    height: 10,
    overflow: "hidden",
  },
  tearTriangleBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#F0F2F5",
  },
  receiptInner: {
    padding: 24,
    paddingTop: 16,
  },
  checkCircle: {
    alignSelf: "center",
    marginBottom: 12,
  },
  brand: {
    fontSize: 18,
    fontWeight: "900" as const,
    color: Colors.dark,
    textAlign: "center" as const,
  },
  partnerLabel: {
    fontSize: 8,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 1.5,
    textAlign: "center" as const,
    marginTop: 2,
  },
  campus: {
    fontSize: 10,
    color: Colors.lightGray,
    textAlign: "center" as const,
    marginTop: 2,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.dark,
  },
  txId: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  billingLabel: {
    fontSize: 8,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  billingTitle: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.dark,
    marginBottom: 2,
  },
  billingRoute: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 1,
  },
  billingRouteTo: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: "600" as const,
    marginTop: 1,
  },
  billingAmount: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: Colors.dark,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  feeLabel: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: "600" as const,
  },
  feeValue: {
    fontSize: 10,
    color: Colors.dark,
    fontWeight: "700" as const,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed" as const,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: Colors.dark,
  },
  totalRight: {
    alignItems: "flex-end",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "900" as const,
    color: Colors.primary,
  },
  voidedAmount: {
    color: Colors.red,
    textDecorationLine: "line-through",
  },
  voidedLabel: {
    fontSize: 8,
    fontWeight: "700" as const,
    color: Colors.red,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  scanText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: Colors.lightGray,
    letterSpacing: 1,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
