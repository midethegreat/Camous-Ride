import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Menu,
  ShieldCheck,
  Clock,
  Truck,
  Package,
  FileText,
  Bell,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import DrawerMenu from "@/components/DrawerMenu";
import Header from "@/components/Header";

const { width } = Dimensions.get("window");

const PLANNED_SERVICES = [
  {
    title: "Food Delivery",
    desc: "Order from campus vendors like Motion Ground or Bukka.",
    tag: "FAST",
    icon: Truck,
  },
  {
    title: "Deliveries",
    desc: "Get a student partner to help with deliveries across halls.",
    tag: "SAFE",
    icon: Package,
  },
  {
    title: "Paper Courier",
    desc: "Secure document moving between departments & admin.",
    tag: "OFFICIAL",
    icon: FileText,
  },
];

export default function ServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [activeImage, setActiveImage] = React.useState(0);

  const carouselImages = [
    require("../assets/images/1.jpg"),
    require("../assets/images/2.webp"),
    require("../assets/images/3.jpg"),
  ];

  // Auto-slide carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Services"
        subtitle="BEYOND CAMPUS COMMUTING"
        onMenuPress={() => setDrawerOpen(true)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.carouselContainer}>
          <Image
            source={carouselImages[activeImage]}
            style={StyleSheet.absoluteFillObject}
            resizeMode="contain"
          />
          <View style={styles.pagination}>
            {carouselImages.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, activeImage === i && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PLANNED SERVICES</Text>
          <View style={styles.verifiedHub}>
            <ShieldCheck size={14} color={Colors.primary} />
            <Text style={styles.verifiedHubText}>VERIFIED HUB</Text>
          </View>
        </View>

        {PLANNED_SERVICES.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={styles.serviceCard}
            onPress={() => {
              if (service.title === "Food Delivery") {
                router.push("/food-delivery");
              } else {
                // For other services, show coming soon alert
                alert(`${service.title} is coming soon!`);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              {service.title !== "Food Delivery" && (
                <View style={styles.comingSoonBadge}>
                  <Clock size={10} color={Colors.primary} />
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
              )}
            </View>
            <Text style={styles.serviceDesc}>{service.desc}</Text>
            <Text
              style={[
                styles.serviceTag,
                service.title === "Food Delivery" && { color: Colors.primary },
              ]}
            >
              {service.title === "Food Delivery" ? "AVAILABLE" : service.tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  carouselContainer: {
    borderRadius: 18,
    height: 180, // Same size as previous box
    marginBottom: 24,
    overflow: "hidden", // Ensure image stays inside
    justifyContent: "flex-end",
    padding: 12, // For pagination dots
  },
  pagination: {
    flexDirection: "row",
    gap: 6,
    alignSelf: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.2)", // Darker dots for light images
  },
  activeDot: {
    backgroundColor: Colors.primary, // Using brand color for active dot
    width: 20, // Expanded dot for active state
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
  verifiedHub: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedHubText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.dark,
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  serviceDesc: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 19,
    marginBottom: 10,
  },
  serviceTag: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.lightGray,
    letterSpacing: 1,
    alignSelf: "flex-end",
  },
});
