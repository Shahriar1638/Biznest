const {
  findMyLastOrder,
  getOrderStatus,
  getTransactionHistory,
  requestRefund,
  checkInventory,
  escalateToHuman,
  searchKnowledgeBase
} = require('./agentTools');

const NESTBOT_SYSTEM_PROMPT = `
You are NestBot, a support assistant for BizNest.
MANDATORY: If a user asks generically about their order (e.g., "where is my order", "order status", "current order"), you MUST CALL findMyLastOrder() immediately. 
DO NOT ASK FOR THE ID FIRST. Fetch the latest order automatically.
Only use getOrderStatus if the user has ALREADY PROVIDED a specific ORD- ID in their message.
Use the knowledge base for FAQs. Escalate frustration to a human support agent.
`;

const tools = [
  {
    type: "function",
    function: {
      name: "findMyLastOrder",
      description: "Get the status of the user's most recent order automatically. Use this when the user asks generically about 'their order'.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "getOrderStatus",
      description: "Get the status of a SPECIFIC order by its ORD- ID.",
      parameters: {
        type: "object",
        properties: {
          orderID: { type: "string", description: "The specific ORD- ID provided by the user." }
        },
        required: ["orderID"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTransactionHistory",
      description: "List recent transactions.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "requestRefund",
      description: "Request a refund.",
      parameters: {
        type: "object",
        properties: {
          orderID: { type: "string" },
          reason: { type: "string" }
        },
        required: ["orderID", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "checkInventory",
      description: "Check product stock.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string" }
        },
        required: ["productName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchKnowledgeBase",
      description: "Search FAQs.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "escalateToHuman",
      description: "Escalate to human support.",
      parameters: {
        type: "object",
        properties: {
          issue: { type: "string" }
        },
        required: ["issue"]
      }
    }
  }
];

/**
 * Route tool call name to the actual implementation in agentTools.js
 */
async function executeTool(name, args, collections) {
  switch (name) {
    case "findMyLastOrder": return findMyLastOrder({ ...args, ...collections });
    case "getOrderStatus": return getOrderStatus({ ...args, ...collections });
    case "getTransactionHistory": return getTransactionHistory({ ...args, ...collections });
    case "requestRefund": return requestRefund({ ...args, ...collections });
    case "checkInventory": return checkInventory({ ...args, ...collections });
    case "searchKnowledgeBase": return searchKnowledgeBase({ ...args, ...collections });
    case "escalateToHuman": return escalateToHuman({ ...args, ...collections });
    default: return { error: `Unknown tool: ${name}` };
  }
}

/**
 * Main Agent Orchestrator
 */
async function runAgent({ message, history, customerEmail, customerName }, collections) {
  const messages = [
    { role: "system", content: NESTBOT_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: message }
  ];

  let iterationCount = 0;
  const MAX_ITERATIONS = 5;

  while (iterationCount < MAX_ITERATIONS) {
    iterationCount++;
    let data;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
          "X-Title": "NestBot",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free",
          messages,
          tools,
          tool_choice: "auto"
        })
      });

      if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`);
      data = await response.json();

    } catch (err) {
      console.warn("OpenRouter failed, switching to Groq fallback:", err.message);
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages,
            tools,
            tool_choice: "auto"
          })
        });

        if (!response.ok) throw new Error(`Groq Error: ${response.status}`);
        data = await response.json();
      } catch (fallbackErr) {
        return "I'm sorry, I'm having trouble connecting to my brain right now.";
      }
    }

    const choice = data.choices[0];
    const assistantMessage = choice.message;
    messages.push(assistantMessage);

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return assistantMessage.content;
    }

    for (const toolCall of assistantMessage.tool_calls) {
      const name = toolCall.function.name;
      let args = {};
      try { args = JSON.parse(toolCall.function.arguments); } catch (e) { args = {}; }

      const result = await executeTool(
        name,
        { ...args, customerEmail, customerName },
        collections
      );

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      });
    }
  }

  return "I'm sorry, I'm stuck in a loop. Let me connect you with a human agent.";
}

module.exports = { runAgent };
