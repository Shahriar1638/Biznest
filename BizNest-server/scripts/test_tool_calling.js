/**
 * Full NestBot Agent Test with tool calling
 */
require('dotenv').config();

async function testAgentWithTools() {
  console.log("🤖 Testing NestBot with tool calling...");
  console.log("   Model:", process.env.OPENROUTER_MODEL);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "NestBot",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: "system", content: "You are NestBot, a support assistant." },
          { role: "user", content: "What is my order status?" }
        ],
        tools: [{
          type: "function",
          function: {
            name: "getOrderStatus",
            description: "Look up order status",
            parameters: {
              type: "object",
              properties: { orderID: { type: "string", description: "Order ID" } },
              required: ["orderID"]
            }
          }
        }],
        tool_choice: "auto"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ FAILED:", response.status, JSON.stringify(data.error || data));
      return;
    }

    const choice = data.choices?.[0];
    console.log("✅ SUCCESS!");
    console.log("   Actual model used:", data.model);
    console.log("   Response type:", choice?.message?.tool_calls ? "TOOL CALL" : "TEXT");
    console.log("   Content:", choice?.message?.content || JSON.stringify(choice?.message?.tool_calls));

  } catch (err) {
    console.error("❌ Exception:", err.message);
  }
}

testAgentWithTools();
