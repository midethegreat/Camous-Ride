import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  LayoutAnimation,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Clock,
  Star,
  ShoppingCart,
  MapPin,
  Flame,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import RiderAssignment from "./rider-assignment";
import { useCart, FoodItem, CartItem } from "@/providers/CartProvider";

const mockFoodItems: FoodItem[] = [
  // Food Items
  {
    id: "1",
    name: "Chicken Shawarma",
    description: "Grilled chicken with vegetables and garlic sauce",
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    category: "Main Course",
    isAvailable: true,
    prepTime: "15-20 min",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Beef Burger",
    description: "hamburger with juicy beef patty, lettuce, tomato",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "Main Course",
    isAvailable: true,
    prepTime: "10-15 min",
    rating: 4.7,
  },
  {
    id: "3",
    name: "Bowl of healthy fresh fruit salad",
    description: "Fresh romaine lettuce with caesar dressing and croutons",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    category: "Salads",
    isAvailable: true,
    prepTime: "5-8 min",
    rating: 4.3,
  },
  {
    id: "6",
    name: "Spicy Fried Tubtim Fish Salad",
    description: "Spicy buffalo wings with blue cheese dip",
    price: 5500,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    category: "Main Course",
    isAvailable: true,
    prepTime: "20-25 min",
    rating: 4.4,
  },
  // Supermarket Items
  {
    id: "s1",
    name: "Dano Milk Powder 800g",
    description: "Full cream instant milk powder",
    price: 4200,
    image:
      "https://images.unsplash.com/photo-1550583724-1255818c0533?w=400&h=300&fit=crop",
    category: "Dairy",
    isAvailable: true,
    prepTime: "5 min",
    rating: 4.8,
  },
  {
    id: "s2",
    name: "Kellogg's Corn Flakes",
    description: "Crunchy golden flakes of corn",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&h=300&fit=crop",
    category: "Cereal",
    isAvailable: true,
    prepTime: "5 min",
    rating: 4.6,
  },
  {
    id: "s3",
    name: "Golden Penny Spaghetti",
    description: "Premium quality durum wheat pasta",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1551462147-3a88588d4a3f?w=400&h=300&fit=crop",
    category: "Pasta",
    isAvailable: true,
    prepTime: "5 min",
    rating: 4.5,
  },
  {
    id: "s4",
    name: "Coca Cola 50cl (Pack of 12)",
    description: "Refreshing carbonated soft drink",
    price: 3600,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop",
    category: "Beverages",
    isAvailable: true,
    prepTime: "5 min",
    rating: 4.9,
  },
];

export default function RestaurantMenuScreen() {
  const { restaurantId, restaurantName } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { cart, addToCart, updateQuantity, totalAmount, totalItems } =
    useCart();

  // Check if it's a supermarket based on the ID or name
  const isSupermarket = useMemo(
    () =>
      restaurantId === "7" ||
      restaurantId === "8" ||
      String(restaurantName).toLowerCase().includes("mart") ||
      String(restaurantName).toLowerCase().includes("grocery"),
    [restaurantId, restaurantName],
  );

  const categories = useMemo(
    () =>
      isSupermarket
        ? ["All", "Dairy", "Cereal", "Pasta", "Beverages"]
        : ["All", "Main Course", "Salads", "Beverages", "Sides"],
    [isSupermarket],
  );

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = useMemo(
    () =>
      mockFoodItems.filter((item) => {
        // Filter by type (food vs supermarket)
        const isSupermarketItem = item.id.startsWith("s");
        if (isSupermarket && !isSupermarketItem) return false;
        if (!isSupermarket && isSupermarketItem) return false;

        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [isSupermarket, searchQuery, selectedCategory],
  );

  // Group items by category for grid sections
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, FoodItem[]> = {};
    filteredItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const handleAddToCart = useCallback(
    (item: FoodItem) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      addToCart(item);
    },
    [addToCart],
  );

  const handleRemoveFromCart = useCallback(
    (itemId: string, currentQty: number) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      updateQuantity(itemId, currentQty - 1);
    },
    [updateQuantity],
  );

  const getItemQuantity = useCallback(
    (itemId: string) => {
      return cart.find((i) => i.item.id === itemId)?.quantity || 0;
    },
    [cart],
  );

  const renderGridItem = (item: FoodItem) => {
    const quantity = getItemQuantity(item.id);

    return (
      <View key={item.id} style={styles.gridItemCard}>
        <Image source={{ uri: item.image }} style={styles.gridItemImage} />
        <View style={styles.gridItemInfo}>
          <Text style={styles.gridItemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.gridItemPrice}>
            ₦{item.price.toLocaleString()}
          </Text>
          <View style={styles.gridItemFooter}>
            <View style={styles.gridRatingRow}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.gridRatingText}>{item.rating}</Text>
            </View>
            <View style={styles.gridQuantityControls}>
              {quantity > 0 && (
                <>
                  <TouchableOpacity
                    style={styles.gridMinusBtn}
                    onPress={() => handleRemoveFromCart(item.id, quantity)}
                  >
                    <Minus size={14} color={Colors.dark} />
                  </TouchableOpacity>
                  <Text style={styles.gridQuantityText}>{quantity}</Text>
                </>
              )}
              <TouchableOpacity
                style={styles.gridAddBtn}
                onPress={() => handleAddToCart(item)}
              >
                <Plus size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSection = (category: string, items: FoodItem[]) => (
    <View key={category} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{category}</Text>
      <View style={styles.gridContainer}>{items.map(renderGridItem)}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurantName || "Menu"}</Text>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push("/cart" as any)}
        >
          <ShoppingCart size={22} color={Colors.dark} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search & Categories */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              isSupermarket ? "Search groceries..." : "Search items..."
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryTab,
              selectedCategory === cat && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === cat && styles.categoryTabTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items Grid with Sections */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.itemsScroll}
        contentContainerStyle={styles.listContent}
      >
        {Object.entries(itemsByCategory).map(([category, items]) =>
          renderSection(category, items),
        )}
      </ScrollView>

      {/* Sticky Footer */}
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>Total amount</Text>
            <Text style={styles.footerPrice}>
              ₦{totalAmount.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutText}>View cart</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF4B3A",
    width: 16,
    height: 18,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
  },
  categoryScroll: {
    height: 0,
    marginTop: -90,
    marginBottom: -200,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryTabActive: {
    backgroundColor: Colors.dark,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gray,
  },
  categoryTabTextActive: {
    color: Colors.white,
  },
  itemsScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  itemImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  tagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tag: {
    backgroundColor: "#FFF5F1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: "#FF7A51",
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "500",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 6,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    padding: 2,
    borderRadius: 16,
  },
  minusBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF4B3A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: "500",
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark,
  },
  checkoutBtn: {
    backgroundColor: "#637351",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  checkoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItemCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  gridItemImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  gridItemInfo: {
    flex: 1,
  },
  gridItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 6,
    lineHeight: 18,
    height: 36,
  },
  gridItemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 8,
  },
  gridItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  gridRatingText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: "500",
  },
  gridQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gridMinusBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gridAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF4B3A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridQuantityText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark,
    minWidth: 16,
    textAlign: "center",
  },
});
