/**
 * Minimalist AI Diagnostic
 */
require('dotenv').config();
const axios = require('axios');

async function testMinimal() {
    console.log("🔍 Diagnosing AI Connection...");
    console.log("Model:", process.env.OPENROUTER_MODEL);

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: process.env.OPENROUTER_MODEL,
            messages: [{ role: "user", content: "Say hello" }]
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ OpenRouter OK:", response.data.choices[0].message.content);
    } catch (err) {
        console.log("❌ OpenRouter 404/Error:", err.response ? `${err.response.status} - ${JSON.stringify(err.response.data)}` : err.message);
    }

    console.log("\nModel:", process.env.GROQ_MODEL);
    try {
        const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
            model: process.env.GROQ_MODEL,
            messages: [{ role: "user", content: "Say hello" }]
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Groq OK:", response.data.choices[0].message.content);
    } catch (err) {
        console.log("❌ Groq 400/Error:", err.response ? `${err.response.status} - ${JSON.stringify(err.response.data)}` : err.message);
    }
}

testMinimal();
