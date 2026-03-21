import React, { useState, useEffect } from "react";
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
} from "lucide-react-native";
import Colors from "@/constants/Colors";

const { width } = Dimensions.get("window");

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
    cuisine: "Coffee & Snacks",
    rating: 4.5,
    deliveryTime: "15-20 min",
    deliveryFee: 2.99,
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "0.5 km",
    popularDishes: ["Coffee", "Sandwiches", "Pastries"],
  },
  {
    id: "2",
    name: "Campus Bukka",
    cuisine: "Local Nigerian",
    rating: 4.3,
    deliveryTime: "25-30 min",
    deliveryFee: 3.49,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "0.8 km",
    popularDishes: ["Jollof Rice", "Pounded Yam", "Egusi Soup"],
  },
  {
    id: "3",
    name: "Pizza Hub",
    cuisine: "Italian",
    rating: 4.6,
    deliveryTime: "20-25 min",
    deliveryFee: 4.99,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "1.2 km",
    popularDishes: ["Pepperoni Pizza", "Margherita", "Chicken Wings"],
  },
  {
    id: "4",
    name: "Burger Junction",
    cuisine: "American",
    rating: 4.4,
    deliveryTime: "15-20 min",
    deliveryFee: 2.49,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "0.3 km",
    popularDishes: ["Cheeseburger", "Chicken Burger", "French Fries"],
  },
  {
    id: "5",
    name: "Asian Express",
    cuisine: "Asian Fusion",
    rating: 4.2,
    deliveryTime: "30-35 min",
    deliveryFee: 3.99,
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop",
    isOpen: false,
    distance: "1.5 km",
    popularDishes: ["Fried Rice", "Noodles", "Spring Rolls"],
  },
  {
    id: "6",
    name: "Healthy Bites",
    cuisine: "Healthy & Salads",
    rating: 4.7,
    deliveryTime: "18-22 min",
    deliveryFee: 2.99,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    isOpen: true,
    distance: "0.6 km",
    popularDishes: ["Caesar Salad", "Smoothies", "Quinoa Bowl"],
  },
];

export default function FoodDeliveryScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push({
      pathname: "/restaurant-menu",
      params: { restaurantId: restaurant.id, restaurantName: restaurant.name },
    });
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
          <ArrowLeft size={20} color={Colors.dark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Food Delivery</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={Colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines, or dishes..."
            placeholderTextColor={Colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Restaurant Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Popular Restaurants</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredRestaurants.length} restaurants near you
            </Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantsGrid}>
          {filteredRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => handleRestaurantPress(restaurant)}
              disabled={!restaurant.isOpen}
              activeOpacity={0.9}
            >
              <View style={styles.restaurantImageContainer}>
                <Image
                  source={{ uri: restaurant.image }}
                  style={styles.restaurantImage}
                  resizeMode="cover"
                />
                {!restaurant.isOpen && (
                  <View style={styles.closedOverlay}>
                    <Text style={styles.closedText}>CLOSED</Text>
                  </View>
                )}
              </View>

              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>
                  {restaurant.cuisine}
                </Text>

                <View style={styles.restaurantDetails}>
                  {renderStars(restaurant.rating)}
                  <View style={styles.detailItem}>
                    <Clock size={14} color={Colors.gray} />
                    <Text style={styles.detailText}>
                      {restaurant.deliveryTime}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={14} color={Colors.gray} />
                    <Text style={styles.detailText}>{restaurant.distance}</Text>
                  </View>
                </View>

                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryFee}>
                    ₦{restaurant.deliveryFee.toFixed(2)} delivery
                  </Text>
                  <View style={styles.popularDishes}>
                    {restaurant.popularDishes.slice(0, 2).map((dish, index) => (
                      <Text key={index} style={styles.dishTag}>
                        {dish}
                      </Text>
                    ))}
                  </View>
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
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 24,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: Colors.dark,
    lineHeight: 20,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  restaurantsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  restaurantCard: {
    width: (width - 64) / 2,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  restaurantImageContainer: {
    position: "relative",
    height: 140,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closedText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  restaurantInfo: {
    padding: 20,
    paddingBottom: 24,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    fontWeight: "500",
  },
  restaurantDetails: {
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
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 6,
    fontWeight: "600",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    color: Colors.gray,
    marginLeft: 4,
    fontWeight: "500",
  },
  deliveryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  deliveryFee: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
  },
  popularDishes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dishTag: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: "600",
  },
});
