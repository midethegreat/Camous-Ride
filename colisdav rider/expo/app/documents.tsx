import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  Shield,
  Car,
  CreditCard,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { vehicleInfo } from "@/constants/driver-data";
import { useRouter } from "expo-router";

interface DocumentItemProps {
  title: string;
  status: "verified" | "pending" | "expired";
  expiryDate: string | null;
  icon: React.ElementType;
  description: string;
}

function DocumentItem({
  title,
  status,
  expiryDate,
  icon: Icon,
  description,
}: DocumentItemProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle2,
          color: Colors.success,
          bgColor: Colors.successLight,
          label: "Verified",
        };
      case "pending":
        return {
          icon: Clock,
          color: Colors.warning,
          bgColor: Colors.warningLight,
          label: "Pending",
        };
      case "expired":
        return {
          icon: AlertCircle,
          color: Colors.error,
          bgColor: Colors.errorLight,
          label: "Expired",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View
          style={[
            styles.documentIcon,
            { backgroundColor: `${Colors.primary}15` },
          ]}
        >
          <Icon size={24} color={Colors.primary} />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{title}</Text>
          <Text style={styles.documentDescription}>{description}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <StatusIcon size={14} color={statusConfig.color} />
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {expiryDate && (
        <View style={styles.expiryRow}>
          <Text style={styles.expiryLabel}>Expires:</Text>
          <Text
            style={[
              styles.expiryDate,
              status === "expired" && { color: Colors.error },
            ]}
          >
            {formatDate(expiryDate)}
          </Text>
        </View>
      )}

      {status !== "verified" && (
        <TouchableOpacity style={styles.uploadButton}>
          <Upload size={18} color={Colors.white} />
          <Text style={styles.uploadText}>Upload Document</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DocumentsScreen() {
  const router = useRouter();
  const { documents } = vehicleInfo;

  const requiredDocs = [
    {
      key: "driversLicense",
      title: "Driver's License",
      description: "Valid Nigerian driver's license",
      icon: CreditCard,
      ...documents.driversLicense,
    },
    {
      key: "vehicleRegistration",
      title: "Vehicle Registration",
      description: "Official vehicle registration certificate",
      icon: FileText,
      ...documents.vehicleRegistration,
    },
    {
      key: "insurance",
      title: "Vehicle Insurance",
      description: "Comprehensive third-party insurance",
      icon: Shield,
      ...documents.insurance,
    },
    {
      key: "hackneyPermit",
      title: "Hackney Permit",
      description: "Commercial vehicle operating permit",
      icon: Car,
      ...documents.hackneyPermit,
    },
  ];

  const verifiedCount = requiredDocs.filter(
    (doc) => doc.status === "verified",
  ).length;
  const progress = (verifiedCount / requiredDocs.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Documents</Text>
          <Text style={styles.headerSubtitle}>VERIFY YOUR ACCOUNT</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Document Verification</Text>
              <Text style={styles.progressSubtitle}>
                {verifiedCount} of {requiredDocs.length} documents verified
              </Text>
            </View>
            <View style={styles.progressPercent}>
              <Text style={styles.progressPercentText}>
                {Math.round(progress)}%
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          {progress < 100 && (
            <View style={styles.progressAlert}>
              <AlertCircle size={16} color={Colors.warning} />
              <Text style={styles.progressAlertText}>
                Complete document verification to receive ride requests
              </Text>
            </View>
          )}
        </View>

        {/* Documents List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          {requiredDocs.map((doc) => (
            <DocumentItem
              key={doc.key}
              title={doc.title}
              status={doc.status}
              expiryDate={doc.expiryDate}
              icon={doc.icon}
              description={doc.description}
            />
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Shield size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            All documents are securely stored and verified by our team.
            Documents are typically reviewed within 24 hours.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },
  progressSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressPercent: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.warningLight,
    borderRadius: 10,
  },
  progressAlertText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning,
    lineHeight: 18,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  documentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  documentDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  expiryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  expiryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 6,
  },
  expiryDate: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.white,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.info,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 32,
  },
});
