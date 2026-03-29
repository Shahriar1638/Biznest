/**
 * OpenRouter Model Picker Diagnostic
 */
require('dotenv').config();
const axios = require('axios');

async function checkModel(modelId) {
    console.log(`Checking ${modelId}...`);
    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: modelId,
                messages: [{ role: "user", content: "hi" }]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "NestBot"
                }
            }
        );
        console.log(`✅ ${modelId} is ACTIVE`);
        return true;
    } catch (err) {
        console.log(`❌ ${modelId} FAILED: ${err.response?.status} - ${JSON.stringify(err.response?.data?.error || err.message)}`);
        return false;
    }
}

async function run() {
    const models = [
        "meta-llama/llama-3.2-3b-instruct:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "mistralai/mistral-7b-instruct:free",
        "openrouter/auto"
    ];

    for (const m of models) {
        await checkModel(m);
    }
}

run();
