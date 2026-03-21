import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CreditCard,
  Bitcoin,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import Colors from "@/constants/Colors";

type DepositReceiptRoute = {
  params: {
    txId?: string;
    amount?: string;
    date?: string;
    status?: string; // "completed" | "pending" | "failed"
    mode?: string; // "Flutterwave (Bank Transfer)" | "Cryptocurrency" | ...
  };
};

const DepositReceipt = ({ route }: { route: DepositReceiptRoute }) => {
  const { params } = route;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const txId = params?.txId ?? "TX-0000";
  const amountNum = Number(params?.amount ?? 0);
  const amount = isNaN(amountNum) ? "0" : amountNum.toLocaleString();
  const date = params?.date
    ? new Date(params.date).toLocaleString()
    : new Date().toLocaleString();
  const status = (params?.status || "completed").toLowerCase();
  const mode = params?.mode || "Flutterwave (Bank Transfer)";

  const isSuccess = status === "completed" || status === "success";
  const ModeIcon = /crypto/i.test(mode) ? Bitcoin : CreditCard;

  const handleShare = async () => {
    const message = [
      "CID Deposit Receipt",
      `Amount: ₦${amount}`,
      `Mode: ${mode}`,
      `Transaction ID: ${txId}`,
      `Date: ${date}`,
      isSuccess ? "Status: SUCCESS" : "Status: FAILED",
    ].join("\n");
    try {
      await Share.share({ message });
    } catch {}
  };

  const handleDownload = () => {
    Alert.alert(
      "Not Available",
      "Saving receipt image is not available in Expo Go.",
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <View style={styles.receiptShot}>
        <View style={styles.tearEdge}>
          {Array.from({ length: 22 }).map((_, i) => (
            <View key={i} style={styles.tearTriangle} />
          ))}
        </View>

        <View style={styles.receiptInner}>
          <View style={styles.headerBar}>
            <View style={styles.statusIcon}>
              {isSuccess ? (
                <CheckCircle2 size={22} color={Colors.white} />
              ) : (
                <XCircle size={22} color={Colors.white} />
              )}
            </View>
            <Text style={styles.headerTitle}>
              {isSuccess ? "Deposit Successful" : "Deposit Failed"}
            </Text>
          </View>

          <Text style={styles.brand}>CID NIGERIA</Text>
          <Text style={styles.partnerLabel}>VERIFIED CAMPUS PARTNER</Text>
          <Text style={styles.campus}>FUNAAB</Text>

          <View style={styles.amountWrap}>
            <Text style={styles.amountCurrency}>NGN</Text>
            <Text style={styles.amountText}>₦{amount}</Text>
          </View>

          <View style={styles.dashedLine} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transaction ID</Text>
            <Text style={[styles.infoValue, styles.infoValueTx]}>{txId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode</Text>
            <View style={styles.modeBadge}>
              <ModeIcon size={16} color={Colors.primary} />
              <Text style={styles.modeText}>{mode}</Text>
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.noteTitle}>Note</Text>
            <Text style={styles.noteText}>
              Funds are added to your COLISDAV wallet. Keep this receipt for
              your records.
            </Text>
          </View>
        </View>

        <View style={styles.tearEdgeBottom}>
          {Array.from({ length: 22 }).map((_, i) => (
            <View key={i} style={styles.tearTriangleBottom} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDownload}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>⇩</Text>
            <Text style={styles.actionBtnText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.actionIcon}>⤴</Text>
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  receiptShot: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
    alignSelf: "center",
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
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  brand: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.dark,
    textAlign: "center",
    marginTop: 14,
  },
  partnerLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 2,
  },
  campus: {
    fontSize: 10,
    color: Colors.lightGray,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  amountWrap: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  amountCurrency: {
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  amountText: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.dark,
  },
  dashedLine: {
    height: 1,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E2E8F0",
    marginHorizontal: 20,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EFEFEF",
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "700",
  },
  infoValueTx: {
    maxWidth: "60%",
    textAlign: "right",
    flexShrink: 1,
    fontSize: 12,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  modeText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  footerNote: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EFEFEF",
  },
  noteTitle: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "800",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: Colors.dark,
    opacity: 0.85,
    lineHeight: 18,
  },
  footer: {
    width: "100%",
    maxWidth: 420,
    paddingTop: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: -2,
  },
  actionBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
});

export default DepositReceipt;
