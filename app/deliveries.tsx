import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  LayoutAnimation,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Star,
  Clock,
  MapPin,
  Filter,
  ArrowLeft,
  Bell,
  Heart,
  Mic,
  Plus,
  ShoppingCart,
  Menu,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useCart } from "@/providers/CartProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  isOpen: boolean;
  distance: string;
  popularDishes: string[];
}

const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Motion Ground Cafe",
    cuisine: "Food",
    rating: 4.5,
    deliveryTime: "15-20 min",
    deliveryFee: 500,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "0.5 km",
    popularDishes: ["Coffee", "Sandwiches", "Pastries"],
  },
  {
    id: "2",
    name: "Campus Bukka",
    cuisine: "Food",
    rating: 4.3,
    deliveryTime: "25-30 min",
    deliveryFee: 700,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "0.8 km",
    popularDishes: ["Jollof Rice", "Pounded Yam", "Egusi Soup"],
  },
  {
    id: "7",
    name: "Mega Mart Supermarket",
    cuisine: "Supermarket",
    rating: 4.8,
    deliveryTime: "30-45 min",
    deliveryFee: 1000,
    image:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "2.1 km",
    popularDishes: ["Groceries", "Toiletries", "Beverages"],
  },
  {
    id: "4",
    name: "Burger Junction",
    cuisine: "Food",
    rating: 4.4,
    deliveryTime: "15-20 min",
    deliveryFee: 500,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "0.3 km",
    popularDishes: ["Cheeseburger", "Chicken Burger", "French Fries"],
  },
  {
    id: "8",
    name: "Express Grocery",
    cuisine: "Supermarket",
    rating: 4.6,
    deliveryTime: "20-30 min",
    deliveryFee: 600,
    image:
      "https://images.unsplash.com/photo-1604719312563-8912e9223c6a?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "1.1 km",
    popularDishes: ["Milk", "Bread", "Eggs"],
  },
];

export default function DeliveriesScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { totalItems } = useCart();

  const categories = useMemo(() => ["All", "Food", "Supermarket"], []);

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        const matchesSearch =
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          activeCategory === "All" || restaurant.cuisine === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    [restaurants, searchQuery, activeCategory],
  );

  const handleRestaurantPress = useCallback(
    (restaurant: Restaurant) => {
      router.push({
        pathname: "/restaurant-menu",
        params: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        },
      });
    },
    [router],
  );

  const handleCategoryPress = useCallback((cat: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCategory(cat);
  }, []);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={star <= rating ? "#FFD700" : "#E0E0E0"}
            fill={star <= rating ? "#FFD700" : "#E0E0E0"}
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => router.replace("/services" as any)}
        >
          <ArrowLeft size={22} color={Colors.dark} />
        </TouchableOpacity>

        <View style={styles.locationContainer}>
          <MapPin size={18} color={Colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            15 Water Street Fremont
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push("/cart")}
          >
            <ShoppingCart size={22} color={Colors.dark} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.replace("/profile" as any)}
          >
            <Text style={styles.avatarLetter}>U</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>Deliveries</Text>
          <Text style={styles.headerSubtitle}>Food, Groceries & more</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search food or groceries..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.searchDivider} />
            <Mic size={20} color={Colors.dark} style={styles.micIcon} />
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryTabs}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                activeCategory === cat && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  activeCategory === cat && styles.categoryTabTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid View of Organizations */}
        <View style={styles.gridContainer}>
          {filteredRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.gridCard}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: restaurant.image }}
                  style={styles.gridImage}
                />
                <View style={styles.ratingBadge}>
                  <Star size={10} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingBadgeText}>
                    {restaurant.rating}
                  </Text>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.restaurantNameGrid} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <View style={styles.metaRow}>
                  <Clock size={12} color={Colors.gray} />
                  <Text style={styles.metaTextGrid}>
                    {restaurant.deliveryTime}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.deliveryFeeText}>
                    ₦{restaurant.deliveryFee.toLocaleString()} delivery
                  </Text>
                  <TouchableOpacity style={styles.addGridBtn}>
                    <Plus size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    zIndex: 10,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  locationContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 12,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    maxWidth: SCREEN_WIDTH * 0.4,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.white,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: "500",
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
  },
  micIcon: {
    marginLeft: 4,
  },
  categoryTabs: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  categoryTabActive: {
    backgroundColor: Colors.dark,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray,
  },
  categoryTabTextActive: {
    color: Colors.white,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  gridCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  imageContainer: {
    height: 120,
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.dark,
    marginLeft: 3,
  },
  cardInfo: {
    padding: 12,
  },
  restaurantNameGrid: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  metaTextGrid: {
    fontSize: 12,
    color: Colors.gray,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryFeeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primary,
  },
  addGridBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark,
    justifyContent: "center",
    alignItems: "center",
  },
});
