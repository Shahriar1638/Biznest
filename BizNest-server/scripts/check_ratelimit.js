/**
 * Rate Limit Diagnostic Script
 */
require('dotenv').config();
const axios = require('axios');

async function checkRateLimits() {
  console.log("🚀 Testing OpenRouter (Model: " + process.env.OPENROUTER_MODEL + ")...");
  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: "user", content: "h" }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    console.log("✅ OpenRouter OK. Remaining:", response.headers['x-ratelimit-remaining'] || 'unknown');
  } catch (err) {
    console.error("❌ OpenRouter Error:", err.response ? err.response.status : err.message);
    if (err.response && err.response.status === 429) {
      console.log("⚠️ CAUTION: OpenRouter rate limit reached!");
    } else if (err.response && err.response.status === 402) {
      console.log("⚠️ CAUTION: OpenRouter credits exhausted!");
    }
  }

  console.log("\n🚀 Testing Groq (Model: " + process.env.GROQ_MODEL + ")...");
  try {
    const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: process.env.GROQ_MODEL,
      messages: [{ role: "user", content: "h" }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    console.log("✅ Groq OK. Remaining Requests:", response.headers['x-ratelimit-remaining-requests'] || 'unknown');
  } catch (err) {
    console.error("❌ Groq Error:", err.response ? err.response.status : err.message);
    if (err.response && err.response.status === 429) {
      console.log("⚠️ CAUTION: Groq rate limit reached!");
    }
  }
}

checkRateLimits();
