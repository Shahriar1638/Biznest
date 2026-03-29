/**
 * Knowledge Base Sync Script for BizNest
 * Seeds the FAQ and Support data for NestBot RAG capabilities.
 */
const { MongoClient } = require('mongodb');
require('dotenv').config();

const faqs = [
  {
    question: "What is your refund policy?",
    answer: "BizNest allows refund requests within 7 days of the payment success. After 7 days, the request window expires for security and vendor guarantee reasons.",
    category: "policy"
  },
  {
    question: "How do I see my order status?",
    answer: "You can see your order status in the Customer Dashboard under 'Transaction History'. NestBot can also fetch this for you if you provide your Order ID.",
    category: "support"
  },
  {
    question: "What are the shipping costs for BDT?",
    answer: "Local shipping within BDT usually ranges from 60 to 150 BDT depending on the parcel weight and vendor location.",
    category: "shipping"
  },
  {
    question: "How do I talk to a human?",
    answer: "If NestBot cannot solve your issue, ask to 'Talk to Support'. We will create a high-priority support ticket for our human team to review.",
    category: "escalation"
  },
  {
    question: "Is BizNest secure?",
    answer: "Yes, we use Stripe for secure payments and JWT tokens for all user sessions. Your data is encrypted and never shared with 3rd parties.",
    category: "security"
  }
];

async function seed() {
  console.log("🚀 Starting BizNest Knowledge Seed...");
  const client = new MongoClient(process.env.DB_URI);

  try {
    await client.connect();
    const db = client.db("BiznestDB");
    const collection = db.collection("knowledge_base");

    // Clear existing (optional, but good for fresh seed)
    await collection.deleteMany({});

    // For RAG we eventually need embeddings. 
    // For now, we seed the raw text. NestBot's searchKnowledgeBase tool 
    // will use text-based search as a fallback if Vector Search isn't set up yet.
    const docs = faqs.map(faq => ({
      ...faq,
      content: `${faq.question} ${faq.answer}`,
      last_synced: new Date()
    }));

    const result = await collection.insertMany(docs);
    console.log(`✅ Successfully seeded ${result.insertedCount} FAQ entries.`);
    
    console.log("\n⚠️ IMPORTANT: To enable Vector Search (High Accuracy RAG):");
    console.log("1. Go to MongoDB Atlas -> Search");
    console.log("2. Create a 'Vector Search' index on 'knowledge_base' collection.");
    console.log("3. Use the JSON config provided in NESTBOT_PLAN.md");

  } catch (error) {
    console.error("❌ Seeding Failed:", error);
  } finally {
    await client.close();
  }
}

seed();
