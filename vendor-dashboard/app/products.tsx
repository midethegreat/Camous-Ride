import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Clock,
  X,
  Save,
  Camera,
  Search,
  Filter,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
}

const CATEGORIES = ["Food", "Drinks", "Snacks", "Desserts", "Combo"];

export default function ProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Food",
    preparationTime: "15",
    ingredients: "",
    allergens: "",
    isAvailable: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with API call
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Jollof Rice & Chicken",
          description: "Classic Nigerian jollof rice with grilled chicken",
          price: 1500,
          category: "Food",
          isAvailable: true,
          preparationTime: 25,
          ingredients: ["Rice", "Tomatoes", "Chicken", "Spices"],
          allergens: ["Gluten"],
        },
        {
          id: "2",
          name: "Fried Rice & Turkey",
          description: "Delicious fried rice with turkey pieces",
          price: 1800,
          category: "Food",
          isAvailable: true,
          preparationTime: 30,
          ingredients: ["Rice", "Vegetables", "Turkey", "Soy Sauce"],
          allergens: ["Soy", "Gluten"],
        },
        {
          id: "3",
          name: "Coca Cola",
          description: "Chilled Coca Cola drink",
          price: 200,
          category: "Drinks",
          isAvailable: true,
          preparationTime: 2,
          ingredients: ["Coca Cola"],
          allergens: [],
        },
        {
          id: "4",
          name: "Meat Pie",
          description: "Fresh baked meat pie",
          price: 300,
          category: "Snacks",
          isAvailable: false,
          preparationTime: 20,
          ingredients: ["Flour", "Minced Meat", "Butter"],
          allergens: ["Gluten", "Dairy"],
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const productData: Product = {
        id: editingProduct?.id || Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        isAvailable: formData.isAvailable,
        preparationTime: parseInt(formData.preparationTime),
        ingredients: formData.ingredients
          ? formData.ingredients.split(",").map((i) => i.trim())
          : [],
        allergens: formData.allergens
          ? formData.allergens.split(",").map((a) => a.trim())
          : [],
      };

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? productData : p)),
        );
      } else {
        setProducts((prev) => [...prev, productData]);
      }

      setShowProductModal(false);
      resetForm();
    } catch (error) {
      Alert.alert("Error", "Failed to save product");
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
          },
        },
      ],
    );
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      preparationTime: product.preparationTime.toString(),
      ingredients: product.ingredients?.join(", ") || "",
      allergens: product.allergens?.join(", ") || "",
      isAvailable: product.isAvailable,
    });
    setShowProductModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Food",
      preparationTime: "15",
      ingredients: "",
      allergens: "",
      isAvailable: true,
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, isAvailable: !product.isAvailable }
          : product,
      ),
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <X size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setShowProductModal(true);
          }}
          style={styles.addButton}
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {["All", ...CATEGORIES].map((category) => (
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

      {/* Products List */}
      <ScrollView style={styles.productsList}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color={Colors.lightGray} />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>
              Add your first product to get started
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>
                    {product.description}
                  </Text>
                  <View style={styles.productMeta}>
                    <View style={styles.metaItem}>
                      <DollarSign size={14} color={Colors.primary} />
                      <Text style={styles.metaText}>₦{product.price}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={Colors.accent} />
                      <Text style={styles.metaText}>
                        {product.preparationTime}min
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.productActions}>
                  <Switch
                    value={product.isAvailable}
                    onValueChange={() => toggleAvailability(product.id)}
                    trackColor={{
                      false: Colors.lightGray,
                      true: Colors.primary,
                    }}
                    thumbColor={Colors.white}
                  />
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditProduct(product)}
                    >
                      <Edit size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteProduct(product)}
                    >
                      <Trash2 size={16} color={Colors.red} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.productFooter}>
                <Text style={styles.categoryBadge}>{product.category}</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    product.isAvailable ? styles.available : styles.unavailable,
                  ]}
                >
                  {product.isAvailable ? "Available" : "Unavailable"}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Product Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </Text>
            <TouchableOpacity
              onPress={handleSaveProduct}
              style={styles.saveButton}
            >
              <Save size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableOpacity style={styles.imageUpload}>
              <Camera size={32} color={Colors.primary} />
              <Text style={styles.imageUploadText}>Add Product Image</Text>
            </TouchableOpacity>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your product"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Price (₦) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text })
                  }
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        formData.category === category &&
                          styles.categoryOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.category === category &&
                            styles.categoryOptionTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Preparation Time (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="15"
                value={formData.preparationTime}
                onChangeText={(text) =>
                  setFormData({ ...formData, preparationTime: text })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ingredients (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="Rice, Chicken, Tomatoes"
                value={formData.ingredients}
                onChangeText={(text) =>
                  setFormData({ ...formData, ingredients: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Allergens (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="Gluten, Dairy, Nuts"
                value={formData.allergens}
                onChangeText={(text) =>
                  setFormData({ ...formData, allergens: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Available for Order</Text>
                <Switch
                  value={formData.isAvailable}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isAvailable: value })
                  }
                  trackColor={{ false: Colors.lightGray, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  filterButton: {
    padding: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  categoryContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.gray,
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.gray,
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.lightGray,
    marginTop: 8,
    textAlign: "center",
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
  productMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "500",
  },
  productActions: {
    alignItems: "flex-end",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    padding: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: Colors.redLight,
    borderRadius: 8,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  categoryBadge: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
  },
  available: {
    color: Colors.green,
    backgroundColor: Colors.greenLight,
  },
  unavailable: {
    color: Colors.red,
    backgroundColor: Colors.redLight,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  imageUpload: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    marginBottom: 24,
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    color: Colors.gray,
  },
  categoryOptionTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
