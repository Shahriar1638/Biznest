/**
 * Database Verification Script
 * List all orders for the test customer.
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function listOrders() {
  const client = new MongoClient(process.env.DB_URI);
  try {
    await client.connect();
    const db = client.db('BiznestDB');
    const orders = await db.collection('payments_details').find({ email: 'customer@biznest.com' }).toArray();
    
    if (orders.length === 0) {
      console.log("❌ No orders found for customer@biznest.com");
    } else {
      console.log("✅ Orders found:");
      orders.forEach(o => {
        console.log(`- ID: ${o.orderID} | Status: ${o.payment_status} | Amount: ${o.final_amount}`);
      });
    }
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  } finally {
    await client.close();
  }
}

listOrders();
