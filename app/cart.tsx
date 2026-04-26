import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useCart } from "@/providers/CartProvider";

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalAmount,
    totalItems,
    clearCart,
  } = useCart();

  // Restaurant info removed - Twilio service deleted

  if (totalItems === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added anything to your cart yet.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push("/deliveries" as any)}
          >
            <Text style={styles.browseBtnText}>Browse Stores</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>My Cart ({totalItems})</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
          <Trash2 size={20} color="#FF4B3A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {cart.map((item) => (
          <View key={item.item.id} style={styles.cartItem}>
            <Image source={{ uri: item.item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.item.name}
              </Text>
              <Text style={styles.itemCategory}>{item.item.category}</Text>
              <Text style={styles.itemPrice}>
                ₦{(item.item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.item.id, item.quantity - 1)}
              >
                <Minus size={16} color={Colors.dark} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.item.id, item.quantity + 1)}
              >
                <Plus size={16} color={Colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₦{totalAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₦500</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₦{(totalAmount + 500).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            router.push("/checkout" as any);
          }}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
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
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  itemCategory: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 10,
    color: Colors.dark,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  checkoutBtn: {
    backgroundColor: "#637351",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 30,
    backgroundColor: Colors.dark,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  browseBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
