/**
 * OpenRouter Diagnostic Script (Auto-Router)
 */
require('dotenv').config();
const axios = require('axios');

async function testAI() {
  console.log("🚀 Testing OpenRouter with 'openrouter/auto'...");
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ ERROR: OPENROUTER_API_KEY is missing from .env!");
    return;
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [{ role: "user", content: "Say 'Success'" }]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "BizNest Demo"
        }
      }
    );

    if (response.data && response.data.choices) {
      console.log("✅ SUCCESS! Output:", response.data.choices[0].message.content);
      console.log("Actual Model Used:", response.data.model);
    } else {
      console.error("❌ FAILED: Unexpected response format.");
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error("❌ FAILED: API Error");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Message:", error.message);
    }
  }
}

testAI();
