import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon,
  DollarSign,
  Package,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
}

export default function ProductManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Campus Burger",
      description: "Juicy beef burger with lettuce, tomato, and special sauce",
      price: 12.99,
      category: "Burgers",
      image: "",
      isAvailable: true,
      preparationTime: 15,
    },
    {
      id: "2",
      name: "Student Pizza",
      description: "Classic cheese pizza perfect for sharing",
      price: 18.99,
      category: "Pizza",
      image: "",
      isAvailable: true,
      preparationTime: 20,
    },
    {
      id: "3",
      name: "Energy Smoothie",
      description: "Fresh fruit smoothie with protein boost",
      price: 6.99,
      category: "Beverages",
      image: "",
      isAvailable: false,
      preparationTime: 5,
    },
  ]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Burgers",
    "Pizza",
    "Beverages",
    "Snacks",
    "Desserts",
  ];

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Burgers",
    preparationTime: "",
    isAvailable: true,
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      image: "",
      isAvailable: productForm.isAvailable,
      preparationTime: parseInt(productForm.preparationTime) || 0,
    };

    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? newProduct : p)),
      );
    } else {
      setProducts([...products, newProduct]);
    }

    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "Burgers",
      preparationTime: "",
      isAvailable: true,
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      preparationTime: product.preparationTime.toString(),
      isAvailable: product.isAvailable,
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setProducts(products.filter((p) => p.id !== productId)),
        },
      ],
    );
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p,
      ),
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Product Management</Text>
        <Text style={styles.headerSubtitle}>
          Manage your menu items and availability
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
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

      <ScrollView style={styles.contentContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.green} />
            <Text style={styles.statNumber}>
              {products.filter((p) => p.isAvailable).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>Products</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}
          >
            <Plus size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        {filteredProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productImageContainer}>
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <ImageIcon size={32} color={Colors.gray} />
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  ${product.price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.productDescription} numberOfLines={2}>
                {product.description}
              </Text>
              <View style={styles.productFooter}>
                <View style={styles.productMeta}>
                  <Clock size={14} color={Colors.gray} />
                  <Text style={styles.productMetaText}>
                    {product.preparationTime} min
                  </Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.availabilityToggle}
                    onPress={() => toggleProductAvailability(product.id)}
                  >
                    {product.isAvailable ? (
                      <Eye size={18} color={Colors.green} />
                    ) : (
                      <EyeOff size={18} color={Colors.gray} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditProduct(product)}
                  >
                    <Edit size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 size={16} color={Colors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showProductModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowProductModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  value={productForm.name}
                  onChangeText={(text) =>
                    setProductForm({ ...productForm, name: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter product description"
                  value={productForm.description}
                  onChangeText={(text) =>
                    setProductForm({ ...productForm, description: text })
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>Price *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={productForm.price}
                    onChangeText={(text) =>
                      setProductForm({ ...productForm, price: text })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.pickerContainer}>
                    {categories.slice(1).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.pickerOption,
                          productForm.category === category &&
                            styles.pickerOptionActive,
                        ]}
                        onPress={() =>
                          setProductForm({ ...productForm, category })
                        }
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            productForm.category === category &&
                              styles.pickerOptionTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Preparation Time (minutes)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="15"
                  value={productForm.preparationTime}
                  onChangeText={(text) =>
                    setProductForm({ ...productForm, preparationTime: text })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.switchLabel}>Available for ordering</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    productForm.isAvailable && styles.switchActive,
                  ]}
                  onPress={() =>
                    setProductForm({
                      ...productForm,
                      isAvailable: !productForm.isAvailable,
                    })
                  }
                >
                  <View
                    style={[
                      styles.switchThumb,
                      productForm.isAvailable && styles.switchThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProduct}
              >
                <Text style={styles.saveButtonText}>
                  {editingProduct ? "Update Product" : "Add Product"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  searchBar: {
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
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 8,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  productMetaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  productActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityToggle: {
    padding: 8,
    marginRight: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
  },
  modalClose: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: Colors.gray,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.dark,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
  },
  inputHalf: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 4,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginVertical: 2,
  },
  pickerOptionActive: {
    backgroundColor: Colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.gray,
  },
  pickerOptionTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.dark,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.gray,
    padding: 2,
  },
  switchActive: {
    backgroundColor: Colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
  },
  switchThumbActive: {
    alignSelf: "flex-end",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
