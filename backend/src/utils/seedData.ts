import { AppDataSource } from "../data-source";
import { Vendor } from "../entities/Vendor";
import { Product } from "../entities/Product";

/**
 * Seed sample vendors and products for testing
 */
export async function seedSampleData() {
  try {
    const vendorRepository = AppDataSource.getRepository(Vendor);
    const productRepository = AppDataSource.getRepository(Product);

    // Check if vendors already exist
    const existingVendors = await vendorRepository.find();
    if (existingVendors.length > 0) {
      console.log("[SEED] Sample data already exists, skipping...");
      return;
    }

    console.log("[SEED] Creating sample vendors and products...");

    // Create sample vendors
    const vendors = [
      {
        phoneNumber: "+2348012345678",
        businessName: "Tasty Bites Restaurant",
        email: "info@tastybites.com",
        isActive: true,
      },
      {
        phoneNumber: "+2348098765432",
        businessName: "Burger Palace",
        email: "contact@burgerpalace.com",
        isActive: true,
      },
      {
        phoneNumber: "+2348076543210",
        businessName: "Pizza Express",
        email: "hello@pizzaexpress.com",
        isActive: true,
      },
    ];

    const createdVendors = await vendorRepository.save(vendors);
    console.log(`[SEED] Created ${createdVendors.length} vendors`);

    // Create sample products for each vendor
    const products = [
      // Tasty Bites products
      {
        name: "Jollof Rice",
        price: 1500,
        description: "Delicious Nigerian jollof rice with chicken",
        vendor: createdVendors[0],
        isAvailable: true,
      },
      {
        name: "Fried Rice",
        price: 1200,
        description: "Special fried rice with vegetables",
        vendor: createdVendors[0],
        isAvailable: true,
      },
      {
        name: "Chicken Wings",
        price: 800,
        description: "Crispy chicken wings (4 pieces)",
        vendor: createdVendors[0],
        isAvailable: true,
      },
      // Burger Palace products
      {
        name: "Classic Burger",
        price: 2500,
        description: "Beef burger with lettuce, tomato, and special sauce",
        vendor: createdVendors[1],
        isAvailable: true,
      },
      {
        name: "Cheese Burger",
        price: 2800,
        description: "Classic burger with extra cheese",
        vendor: createdVendors[1],
        isAvailable: true,
      },
      {
        name: "French Fries",
        price: 500,
        description: "Crispy golden french fries",
        vendor: createdVendors[1],
        isAvailable: true,
      },
      // Pizza Express products
      {
        name: "Margherita Pizza",
        price: 3500,
        description: "Classic pizza with tomato sauce and mozzarella",
        vendor: createdVendors[2],
        isAvailable: true,
      },
      {
        name: "Pepperoni Pizza",
        price: 4000,
        description: "Pizza with pepperoni and mozzarella",
        vendor: createdVendors[2],
        isAvailable: true,
      },
      {
        name: "Chicken Wings",
        price: 1000,
        description: "Spicy chicken wings (6 pieces)",
        vendor: createdVendors[2],
        isAvailable: true,
      },
    ];

    const createdProducts = await productRepository.save(products);
    console.log(`[SEED] Created ${createdProducts.length} products`);

    console.log("[SEED] Sample data created successfully!");

    // Log vendor details for testing
    console.log("\n[SEED] Test Vendor Details:");
    createdVendors.forEach((vendor) => {
      console.log(`- ${vendor.businessName}: ${vendor.phoneNumber}`);
    });
  } catch (error) {
    console.error("[SEED] Error creating sample data:", error);
  }
}
