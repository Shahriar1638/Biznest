/**
 * Live API Verification Script
 * Mimics a frontend request to /ai/chat with a real JWT token.
 */
require('dotenv').config();
const axios = require('axios');

async function testLiveAPI() {
  const email = 'customer@biznest.com';
  const password = 'User123!';

  try {
    console.log("🚀 Logging in to get token...");
    const loginRes = await axios.post('http://localhost:3000/auth/login', { email, password });
    const token = loginRes.data.token;
    console.log("✅ Token received.");

    console.log("\n🚀 Testing AI Chat: 'Where is my order?'");
    const aiRes = await axios.post('http://localhost:3000/ai/chat', {
      message: "Where is my order?",
      history: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("🤖 NestBot Response:");
    console.log(JSON.stringify(aiRes.data, null, 2));

  } catch (err) {
    console.error("❌ Test Failed:", err.response ? err.response.data : err.message);
  }
}

testLiveAPI();
