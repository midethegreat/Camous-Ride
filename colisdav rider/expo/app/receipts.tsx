import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { CustomHeader } from "@/components/CustomHeader";
import { Colors } from "@/constants/color";
import {
  Download,
  Share2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
} from "lucide-react-native";

interface Receipt {
  id: string;
  rideId: string;
  date: string;
  pickup: string;
  dropoff: string;
  fare: number;
  driverName: string;
  driverPhone: string;
  distance: number;
  duration: number;
  paymentMethod: string;
}

export default function ReceiptsScreen() {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const receipts: Receipt[] = [
    {
      id: "1",
      rideId: "RD-2024-001",
      date: "2024-01-15 14:30",
      pickup: "Lagos Island",
      dropoff: "Ikeja",
      fare: 2500,
      driverName: "John Doe",
      driverPhone: "+2348012345678",
      distance: 12.5,
      duration: 25,
      paymentMethod: "Cash",
    },
    {
      id: "2",
      rideId: "RD-2024-002",
      date: "2024-01-14 09:15",
      pickup: "Victoria Island",
      dropoff: "Lekki",
      fare: 1800,
      driverName: "Jane Smith",
      driverPhone: "+2348098765432",
      distance: 8.3,
      duration: 18,
      paymentMethod: "Card",
    },
    {
      id: "3",
      rideId: "RD-2024-003",
      date: "2024-01-13 16:45",
      pickup: "Yaba",
      dropoff: "Surulere",
      fare: 1200,
      driverName: "Mike Johnson",
      driverPhone: "+2348034567890",
      distance: 5.7,
      duration: 12,
      paymentMethod: "Cash",
    },
  ];

  const handleDownload = (receipt: Receipt) => {
    // Simulate download functionality
    alert(`Downloading receipt ${receipt.rideId}`);
  };

  const handleShare = (receipt: Receipt) => {
    // Simulate share functionality
    alert(`Sharing receipt ${receipt.rideId}`);
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (selectedReceipt) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Receipt Details" />

        <ScrollView style={styles.content}>
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Ride Receipt</Text>
              <Text style={styles.receiptId}>{selectedReceipt.rideId}</Text>
            </View>

            <View style={styles.receiptSection}>
              <View style={styles.dateTimeRow}>
                <Calendar size={16} color={Colors.textMuted} />
                <Text style={styles.dateTimeText}>{selectedReceipt.date}</Text>
              </View>
            </View>

            <View style={styles.routeSection}>
              <View style={styles.routeItem}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.routeText}>{selectedReceipt.pickup}</Text>
              </View>
              <View style={styles.routeDivider} />
              <View style={styles.routeItem}>
                <MapPin size={16} color={Colors.error} />
                <Text style={styles.routeText}>{selectedReceipt.dropoff}</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>
                  {selectedReceipt.distance} km
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>
                  {selectedReceipt.duration} min
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>
                  {selectedReceipt.paymentMethod}
                </Text>
              </View>
            </View>

            <View style={styles.driverSection}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              <View style={styles.driverInfo}>
                <User size={16} color={Colors.textMuted} />
                <Text style={styles.driverText}>
                  {selectedReceipt.driverName}
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <Phone size={16} color={Colors.textMuted} />
                <Text style={styles.driverText}>
                  {selectedReceipt.driverPhone}
                </Text>
              </View>
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(selectedReceipt.fare)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => handleDownload(selectedReceipt)}
            >
              <Download size={20} color={Colors.background} />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => handleShare(selectedReceipt)}
            >
              <Share2 size={20} color={Colors.primary} />
              <Text style={[styles.actionButtonText, styles.shareButtonText]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedReceipt(null)}
          >
            <Text style={styles.backButtonText}>Back to Receipts</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Receipts" />

      <ScrollView style={styles.content}>
        {receipts.map((receipt) => (
          <TouchableOpacity
            key={receipt.id}
            style={styles.receiptItem}
            onPress={() => setSelectedReceipt(receipt)}
          >
            <View style={styles.receiptInfo}>
              <View style={styles.receiptHeaderRow}>
                <Text style={styles.receiptId}>{receipt.rideId}</Text>
                <Text style={styles.receiptAmount}>
                  {formatCurrency(receipt.fare)}
                </Text>
              </View>

              <View style={styles.receiptDetails}>
                <View style={styles.locationRow}>
                  <MapPin size={14} color={Colors.primary} />
                  <Text style={styles.locationText}>{receipt.pickup}</Text>
                </View>
                <View style={styles.locationRow}>
                  <MapPin size={14} color={Colors.error} />
                  <Text style={styles.locationText}>{receipt.dropoff}</Text>
                </View>
              </View>

              <View style={styles.receiptFooter}>
                <Text style={styles.receiptDate}>{receipt.date}</Text>
                <Text style={styles.receiptPayment}>
                  {receipt.paymentMethod}
                </Text>
              </View>
            </View>

            <View style={styles.receiptActions}>
              <TouchableOpacity
                onPress={() => handleDownload(receipt)}
                style={styles.miniButton}
              >
                <Download size={16} color={Colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleShare(receipt)}
                style={styles.miniButton}
              >
                <Share2 size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  receiptItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptInfo: {
    flex: 1,
  },
  receiptHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  receiptId: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  receiptDetails: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  receiptFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  receiptPayment: {
    fontSize: 12,
    color: Colors.textMuted,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  receiptActions: {
    flexDirection: "row",
    marginLeft: 16,
  },
  miniButton: {
    padding: 8,
    marginLeft: 8,
  },
  receiptCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  receiptSection: {
    marginBottom: 20,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  routeSection: {
    marginBottom: 20,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  routeText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  routeDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
    marginLeft: 28,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  driverSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  driverText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  totalSection: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
  },
  shareButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background,
  },
  shareButtonText: {
    color: Colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  backButton: {
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500",
  },
});
