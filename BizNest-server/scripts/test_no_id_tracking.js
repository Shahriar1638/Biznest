/**
 * Test Account-Specific Order Tracking (No ID)
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { runAgent } = require('../services/agentService');

async function testOrderTracking() {
    const client = new MongoClient(process.env.DB_URI);
    try {
        await client.connect();
        const db = client.db('BiznestDB');
        const collections = {
            paymentCollection: db.collection('payments_details'),
            productCollection: db.collection('products_collection'),
            contactCollection: db.collection('contact_messages'),
            knowledgeCollection: db.collection('knowledge_base')
        };

        const testUser = {
            message: "Where is my order? I didn't get any update.",
            history: [],
            customerEmail: "customer@biznest.com",
            customerName: "Test Customer"
        };

        console.log("🚀 Testing: 'Where is my order?' (No ID provided)");
        const response = await runAgent(testUser, collections);
        console.log("\n🤖 NestBot Response:\n", response);

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await client.close();
    }
}

testOrderTracking();
