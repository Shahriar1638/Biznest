/**
 * BizNest Full Database Seed
 * Populates Users, Products, and Sample Orders for testing.
 */
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
  console.log("🚀 Starting Full Database Seed on cluster: cluster0.eyric6x.mongodb.net");
  const client = new MongoClient(process.env.DB_URI);

  try {
    await client.connect();
    const db = client.db("BiznestDB");
    
    // 1. Seed Users
    const usersColl = db.collection("userinfos");
    const adminPass = await bcrypt.hash("Admin123!", 10);
    const userPass = await bcrypt.hash("User123!", 10);
    
    await usersColl.deleteMany({});
    const users = [
      {
        name: "Dev Admin",
        email: "admin@biznest.com",
        password: adminPass,
        role: "admin",
        status: "verified",
        createdAt: new Date()
      },
      {
        name: "Dev Customer",
        email: "customer@biznest.com",
        password: userPass,
        role: "customer",
        status: "verified",
        createdAt: new Date()
      }
    ];
    await usersColl.insertMany(users);
    console.log("✅ Seeded Admin: admin@biznest.com / Admin123!");
    console.log("✅ Seeded Customer: customer@biznest.com / User123!");

    // 2. Seed Products
    const prodColl = db.collection("products_collection");
    await prodColl.deleteMany({});
    const products = [
      {
        product_id: "PROD-001",
        product_name: "iPhone 15 Pro",
        product_description: "Apple's latest flagship phone with Titanium design.",
        category: "Phones",
        product_price: 999,
        quantity_description: [{ unit_type: "bulk", unit_quantity: 50 }],
        product_status: "released",
        sell_count: [1, 2, 3], // Adding some sell count for "Featured" sorting
        product_image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
        product_publishdate: new Date()
      },
      {
        product_id: "PROD-002",
        product_name: "MacBook Pro M3",
        product_description: "The most powerful laptop for developers.",
        category: "Laptops",
        product_price: 1999,
        quantity_description: [{ unit_type: "bulk", unit_quantity: 20 }],
        product_status: "released",
        sell_count: [1, 2, 3, 4, 5], 
        product_image: "https://images.unsplash.com/photo-1517336710211-4e2a584636e9",
        product_publishdate: new Date()
      },
      {
        product_id: "PROD-003",
        product_name: "Sony WH-1000XM5",
        product_description: "Industry leading noise canceling headphones.",
        category: "Audio",
        product_price: 349,
        quantity_description: [{ unit_type: "bulk", unit_quantity: 100 }],
        product_status: "released",
        sell_count: [1],
        product_image: "https://images.unsplash.com/photo-1618366712277-721644208bc6",
        product_publishdate: new Date()
      }
    ];
    await prodColl.insertMany(products);
    console.log("✅ Seeded 3 Core Products (iPhone, MacBook, Sony).");

    // 3. Seed Sample Orders (for testing Refund & Order Status)
    const paymentColl = db.collection("payments_details");
    await paymentColl.deleteMany({});
    const payments = [
      {
        orderID: "ORD-TEST-001",
        email: "customer@biznest.com",
        final_amount: 999,
        payment_status: "succeeded",
        payment_date: new Date().toISOString().split('T')[0],
        payment_timestamp: new Date(),
        refund_status: "none",
        items_name: ["iPhone 15 Pro"]
      }
    ];
    await paymentColl.insertMany(payments);
    console.log("✅ Seeded 1 Sample Order for #ORD-TEST-001.");

    console.log("\n✨ DATABASE SEEDING COMPLETE! ✨");

  } catch (err) {
    console.error("❌ Seed Error:", err);
  } finally {
    await client.close();
  }
}

seed();
