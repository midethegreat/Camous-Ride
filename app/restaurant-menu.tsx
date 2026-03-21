import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
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
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import RiderAssignment from "./rider-assignment";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  prepTime: string;
  rating: number;
}

interface CartItem {
  item: FoodItem;
  quantity: number;
}

const mockFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Chicken Shawarma",
    description: "Grilled chicken with vegetables and garlic sauce",
    price: 8.99,
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
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "Main Course",
    isAvailable: true,
    prepTime: "10-15 min",
    rating: 4.7,
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with caesar dressing and croutons",
    price: 6.99,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    category: "Salads",
    isAvailable: true,
    prepTime: "5-8 min",
    rating: 4.3,
  },
  {
    id: "4",
    name: "French Fries",
    description: "Crispy golden fries with special seasoning",
    price: 3.99,
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f3909f59?w=400&h=300&fit=crop",
    category: "Sides",
    isAvailable: true,
    prepTime: "5-7 min",
    rating: 4.6,
  },
  {
    id: "5",
    name: "Chocolate Milkshake",
    description: "Rich chocolate milkshake with whipped cream",
    price: 4.99,
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
    category: "Beverages",
    isAvailable: true,
    prepTime: "3-5 min",
    rating: 4.8,
  },
  {
    id: "6",
    name: "Chicken Wings",
    description: "Spicy buffalo wings with blue cheese dip",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    category: "Appetizers",
    isAvailable: false,
    prepTime: "20-25 min",
    rating: 4.4,
  },
];

export default function RestaurantMenuScreen() {
  const { restaurantId, restaurantName } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showRiderAssignment, setShowRiderAssignment] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showRiderAssignment, setShowRiderAssignment] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const categories = [
    "All",
    "Main Course",
    "Salads",
    "Sides",
    "Beverages",
    "Appetizers",
  ];

  const filteredItems = mockFoodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: FoodItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.item.id === item.id,
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prevCart, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.item.id === itemId,
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem,
        );
      }
      return prevCart.filter((cartItem) => cartItem.item.id !== itemId);
    });
  };

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find((cartItem) => cartItem.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  const getTotalCartPrice = () => {
    return cart.reduce(
      (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
      0,
    );
  };

  const handleOrder = () => {
    if (cart.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before ordering.",
      );
      return;
    }

    Alert.alert(
      "Confirm Order",
      `Total: ₦${getTotalCartPrice().toFixed(2)}\n\nProceed with order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Order",
          onPress: () => {
            const orderId =
              "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase();
            const orderData = {
              id: orderId,
              restaurantName,
              totalAmount: getTotalCartPrice(),
              estimatedDeliveryTime: "25-30 minutes",
              deliveryAddress: "Campus Hostel, Room 123",
              items: cart.map((item) => ({
                name: item.item.name,
                quantity: item.quantity,
                price: item.item.price,
              })),
            };
            router.push({
              pathname: "./rider-assignment",
              params: { order: JSON.stringify(orderData) },
            });
            setCart([]);
          },
        },
      ],
    );
  };

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <View style={styles.restaurantMeta}>
            <MapPin size={14} color={Colors.gray} />
            <Text style={styles.metaText}>Campus Area</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            placeholderTextColor={Colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food Items List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.foodItem}>
            <View style={styles.foodInfo}>
              <View style={styles.foodHeader}>
                <Text style={styles.foodName}>{item.name}</Text>
                {!item.isAvailable && (
                  <Text style={styles.unavailableText}>Unavailable</Text>
                )}
              </View>
              <Text style={styles.foodDescription}>{item.description}</Text>
              <View style={styles.foodMeta}>
                {renderStars(item.rating)}
                <View style={styles.prepTime}>
                  <Clock size={12} color={Colors.gray} />
                  <Text style={styles.prepTimeText}>{item.prepTime}</Text>
                </View>
              </View>
              <View style={styles.foodFooter}>
                <Text style={styles.foodPrice}>₦{item.price.toFixed(2)}</Text>
                <View style={styles.quantityControls}>
                  {getCartItemQuantity(item.id) > 0 && (
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Minus size={16} color={Colors.white} />
                    </TouchableOpacity>
                  )}
                  {getCartItemQuantity(item.id) > 0 && (
                    <Text style={styles.quantityText}>
                      {getCartItemQuantity(item.id)}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      !item.isAvailable && styles.addButtonDisabled,
                    ]}
                    onPress={() => addToCart(item)}
                    disabled={!item.isAvailable}
                  >
                    <Plus size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Image source={{ uri: item.image }} style={styles.foodImage} />
          </View>
        ))}
      </ScrollView>

      {/* Cart Footer */}
      {getTotalCartItems() > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <View style={styles.cartIconContainer}>
              <ShoppingCart size={20} color={Colors.white} />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalCartItems()}</Text>
              </View>
            </View>
            <View style={styles.cartTextContainer}>
              <Text style={styles.cartTotalText}>
                ₦{getTotalCartPrice().toFixed(2)}
              </Text>
              <Text style={styles.cartItemsText}>
                {getTotalCartItems()} item{getTotalCartItems() !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rider Assignment Screen */}
      {showRiderAssignment && orderDetails && (
        <RiderAssignment
          orderDetails={orderDetails}
          onRiderSelected={(rider) => {
            setShowRiderAssignment(false);
            // Navigate back to main screen after successful assignment
            setTimeout(() => {
              router.back();
            }, 1000);
          }}
          onBack={() => {
            setShowRiderAssignment(false);
            // Restore cart since user went back
            // This would need more sophisticated cart restoration logic
          }}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
  },
  categoryContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  menuContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  foodItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  foodInfo: {
    flex: 1,
    marginRight: 12,
  },
  foodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
    flex: 1,
  },
  unavailableText: {
    fontSize: 10,
    color: Colors.error,
    fontWeight: "600",
    marginLeft: 8,
  },
  foodDescription: {
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 18,
    marginBottom: 8,
  },
  foodMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: Colors.dark,
    marginLeft: 4,
    fontWeight: "600",
  },
  prepTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  prepTimeText: {
    fontSize: 11,
    color: Colors.gray,
    marginLeft: 4,
  },
  foodFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    minWidth: 30,
    textAlign: "center",
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  cartFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  cartInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartIconContainer: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },
  cartTextContainer: {
    gap: 2,
  },
  cartTotalText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
  cartItemsText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  orderButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
});
