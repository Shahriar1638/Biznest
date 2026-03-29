# NestBot — AI Customer Support Agent
## Detailed Implementation Plan

> **Stack**: Node.js (Express) + OpenRouter API + MongoDB Atlas
> **Bot Name**: NestBot
> **Refund Window**: 7 days from `payment_timestamp`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Phase 1 — Database Update](#phase-1--database-update)
4. [Phase 2 — Backend Services](#phase-2--backend-services)
5. [Phase 3 — API Route](#phase-3--api-route)
6. [Phase 4 — Server Registration](#phase-4--server-registration)
7. [Phase 5 — Admin Dashboard Update](#phase-5--admin-dashboard-update)
8. [Phase 6 — Frontend Chat Widget](#phase-6--frontend-chat-widget)
9. [Environment Variables](#environment-variables)
10. [Verification Checklist](#verification-checklist)

---

## Overview

NestBot is an OpenRouter-powered AI agent embedded in the BizNest platform. It handles customer support autonomously using **function calling** — the AI decides which database action to take based on the user's message. The agent is JWT-authenticated, meaning it always knows WHO it is talking to and can safely query their order history.

OpenRouter gives you access to many models (GPT-4o, Claude 3.5 Sonnet, Mistral, LLaMA, etc.) through a single OpenAI-compatible API — you can swap models with one config change.

**Capabilities:**
| Feature | Tool Name | DB Collection Touched |
| :--- | :--- | :--- |
| Basic FAQ answers | *(No tool — LLM answers directly)* | None |
| Order status lookup | `getOrderStatus` | `payments_details` |
| Transaction history | `getTransactionHistory` | `payments_details` |
| Refund request (7 days) | `requestRefund` | `payments_details` |
| Inventory / stock check | `checkInventory` | `products_collection` |
| Knowledge Base Search (RAG) | `searchKnowledgeBase` | `knowledge_base` |
| Escalate to human | `escalateToHuman` | `contact_messages` |

---

## Architecture Diagram

```
[React Client — ChatWidget.jsx]
          │
          │  POST /ai/chat
          │  Headers: Authorization: Bearer <JWT>
          │  Body: { message: "...", history: [...] }
          ▼
[Express Server — aiRoutes.js]
          │
          │  Verifies JWT → extracts customer_email
          ▼
[agentService.js — OpenRouter Orchestrator]
          │
          │  1. Send message + history + tool declarations to OpenRouter
          │  2. Model returns either:
          │       (a) A text response  ──► Return to client
          │       (b) A tool call      ──► Execute tool → feed result back
          │  3. Repeat until final text response
          ▼
[agentTools.js — Tool Implementations]
    ├── getOrderStatus(orderId)
    ├── getTransactionHistory(customerEmail, dateRange)
    ├── requestRefund(orderId, reason)        ← 7-day check enforced here
    ├── checkInventory(productName)
    └── escalateToHuman(issue, priority)
          │
          ▼
[MongoDB Atlas — BiznestDB]
    ├── payments_details   (read + refund flag write)
    ├── products_collection (read only)
    └── contact_messages   (write — escalation tickets)
```

---

## Phase 1 — Database Update

### File: `BizNest-server/models/Payment.js`

Add the following fields to `paymentSchema` to track the refund lifecycle:

```javascript
// --- NestBot Refund Lifecycle Fields ---
refund_status: {
  type: String,
  enum: ['none', 'refund_requested', 'refund_approved', 'refund_rejected', 'refunded'],
  default: 'none'
},
refund_requested_at:  { type: Date },
refund_reason:        { type: String },   // Reason given by customer via bot
refund_approved_at:   { type: Date },
refund_approved_by:   { type: String },   // Admin email who approved
refund_rejected_at:   { type: Date },
refund_rejected_by:   { type: String },   // Admin email who rejected
```

> **SAFETY RULE**: The `requestRefund` tool ONLY sets `refund_status: "refund_requested"`.
> **No Stripe API is called by the bot.** Money is only moved when an admin explicitly approves in the admin panel.

---

## Phase 1.5 — Knowledge Base Setup (RAG)

To enable NestBot to answer FAQ questions semantically, we need a "Vector Store":

1.  **Collection**: Create a new collection `knowledge_base` in your `BiznestDB`.
    - Fields: `content` (String), `embedding` (Array of Doubles), `metadata` (Object).
2.  **Vector Index**: In Atlas UI, go to **Search** -> **Create Search Index** -> **Type: Vector Search (JSON Editor)**.
    - Paste this configuration:
    ```json
    {
      "fields": [
        {
          "type": "vector",
          "path": "embedding",
          "numDimensions": 1536,
          "similarity": "cosine"
        }
      ]
    }
    ```
3.  **Sync Script**: You will need to run a small script to convert your FAQ text into embeddings and save them into this collection.

---

## Phase 2 — Backend Services

### File: `BizNest-server/services/agentTools.js`

This file exports all tool implementations. Each function receives MongoDB collection references injected at startup.

---

#### Tool 1: `getOrderStatus`

```javascript
async function getOrderStatus({ orderID, customerEmail }) {
  // Query payments_details for matching orderID AND customerEmail (security check)
  const order = await paymentCollection.findOne({
    orderID: orderID,
    customer_email: customerEmail
  });

  if (!order) return { error: "Order not found or does not belong to this account." };

  return {
    orderID:        order.orderID,
    status:         order.payment_status,
    amount:         order.final_amount,
    date:           order.payment_date,
    itemCount:      order.itemcount,
    refundStatus:   order.refund_status
  };
}
```

---

#### Tool 2: `getTransactionHistory`

```javascript
async function getTransactionHistory({ customerEmail }) {
  // Fetch last 10 transactions sorted by newest first
  const transactions = await paymentCollection
    .find({ customer_email: customerEmail })
    .sort({ payment_timestamp: -1 })
    .limit(10)
    .toArray();

  return transactions.map(t => ({
    orderID:      t.orderID,
    date:         t.payment_date,
    amount:       t.final_amount,
    status:       t.payment_status,
    refundStatus: t.refund_status,
    items:        t.itemcount
  }));
}
```

---

#### Tool 3: `requestRefund`

```javascript
async function requestRefund({ orderID, reason, customerEmail }) {
  const order = await paymentCollection.findOne({
    orderID: orderID,
    customer_email: customerEmail
  });

  if (!order) return { error: "Order not found." };
  if (order.payment_status !== 'succeeded')
    return { error: "Refund can only be requested for completed payments." };
  if (order.refund_status !== 'none' && order.refund_status !== undefined)
    return { error: `Refund already in status: ${order.refund_status}` };

  // ── 7-DAY WINDOW CHECK ──────────────────────────────────────────────
  // Use payment_timestamp as primary, fallback to createdAt
  const purchaseTimestamp = order.payment_timestamp || order.createdAt;
  if (!purchaseTimestamp) return { error: "Unable to verify purchase date for this order." };

  const purchaseDate = new Date(purchaseTimestamp);
  const daysSincePurchase = (Date.now() - purchaseDate) / (1000 * 60 * 60 * 24);
  
  if (daysSincePurchase > 7) {
    return {
      error: `Refund window expired. Refunds are only accepted within 7 days of purchase.
              This order was placed ${Math.floor(daysSincePurchase)} days ago.`
    };
  }
  // ─────────────────────────────────────────────────────────────────────

  await paymentCollection.updateOne(
    { orderID: orderID },
    { $set: {
        refund_status:       'refund_requested',
        refund_requested_at: new Date(),
        refund_reason:       reason
    }}
  );

  return {
    success: true,
    message: `Refund request submitted for order ${orderID}.
              An admin will review it within 24-48 hours.
              You will be notified once a decision is made.`
  };
}
```

---

#### Tool 4: `checkInventory`

```javascript
async function checkInventory({ productName }) {
  const products = await productCollection.find({
    product_name: { $regex: new RegExp(productName, 'i') },
    product_status: 'released'
  }).limit(5).toArray();

  if (!products.length) return { error: `No products found matching "${productName}".` };

  return products.map(p => ({
    name:     p.product_name,
    category: p.category,
    units: p.quantity_description.map(u => ({
      type:      u.unit_type,
      value:     u.unit_value,
      price:     u.unit_price,
      available: u.unit_quantity > 0 ? 'In Stock' : 'Out of Stock',
      quantity:  u.unit_quantity
    }))
  }));
}

---

#### Tool 6: `searchKnowledgeBase`

```javascript
async function searchKnowledgeBase({ query, knowledgeCollection }) {
  // 1. Generate embedding for user query (RAG step)
  const embedding = await getEmbedding(query);

  // 2. Perform Atlas Vector Search
  const relevantDocs = await knowledgeCollection.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: 100,
        limit: 3
      }
    },
    {
       $project: {
         _id: 0,
         content: 1,
         score: { $meta: "vectorSearchScore" }
       }
    }
  ]).toArray();

  if (!relevantDocs.length) return { error: "No relevant internal documentation found." };

  return relevantDocs.map(d => d.content).join("\n\n---\n\n");
}
```
```

---

#### Tool 5: `escalateToHuman`

```javascript
async function escalateToHuman({ issue, priority = 'high', customerEmail, customerName }) {
  const ticket = {
    name:          customerName,
    email:         customerEmail,
    userEmail:     customerEmail,
    userType:      'customer',
    issueCategory: 'Bot Escalation',
    subject:       `[NestBot Escalation] ${issue.substring(0, 80)}`,
    message:       issue,
    status:        'pending',
    priority:      priority,
    assignedTo:    'bot_escalation',
    createdAt:     new Date()
  };

  const result = await contactCollection.insertOne(ticket);

  return {
    success:  true,
    ticketId: result.insertedId.toString(),
    message:  "I've connected you with our support team. A human agent will review your case. Please check your email for updates."
  };
}
```

---

### File: `BizNest-server/services/agentService.js`

The OpenRouter orchestrator. Uses the OpenAI-compatible API with tool/function calling. The model is configurable — swap the `model` string to change which LLM powers NestBot.

> **Recommended models** (set in `OPENROUTER_MODEL` env var):
> - `openai/gpt-4o` — best tool-calling reliability
> - `anthropic/claude-3.5-sonnet` — excellent reasoning
> - `mistralai/mistral-large` — fast and cost-effective
> - `meta-llama/llama-3.1-70b-instruct` — open-source option

```javascript
const NESTBOT_SYSTEM_PROMPT = `
You are NestBot, the friendly and professional AI customer support assistant for BizNest —
an online marketplace connecting buyers and sellers.

## Your Personality:
- Warm, helpful, and concise.
- Always address the customer by name if you know it.
- If you cannot help, escalate to a human — never leave the customer hanging.

## Your Capabilities:
1. Answer general FAQs about BizNest (shipping, returns, account management).
2. Look up order status by Order ID.
3. Show recent transaction history.
4. Request a refund for orders within 7 days of purchase.
5. Check if a product is in stock.
6. Escalate to a human support agent.

## Rules You Must Follow:
- NEVER make up order information — always call the appropriate tool.
- NEVER promise a refund — only confirm that a refund *request* has been submitted.
- NEVER discuss competitor platforms.
- If a customer is angry or frustrated, always offer escalation to a human.
- Refunds are ONLY available within 7 days of purchase. If outside the window, politely explain the policy.
- ALWAYS confirm the customer's identity is verified (JWT handles this, so all requests are authenticated).
`;

// OpenAI-format tool declarations (identical schema works with OpenRouter)
const tools = [
  {
    type: "function",
    function: {
      name: "getOrderStatus",
      description: "Look up the status and details of a specific order by Order ID.",
      parameters: {
        type: "object",
        properties: {
          orderID: { type: "string", description: "The order ID to look up (starts with ORD-)." }
        },
        required: ["orderID"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getTransactionHistory",
      description: "Retrieve the customer's last 10 transactions.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "requestRefund",
      description: "Submit a refund request for an order within the 7-day window.",
      parameters: {
        type: "object",
        properties: {
          orderID: { type: "string", description: "The order ID to refund." },
          reason:  { type: "string", description: "The customer's reason for requesting a refund." }
        },
        required: ["orderID", "reason"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "checkInventory",
      description: "Check if a product is in stock.",
      parameters: {
        type: "object",
        properties: {
          productName: { type: "string", description: "The name or partial name of the product to search." }
        },
        required: ["productName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "searchKnowledgeBase",
      description: "Search internal FAQs and policy documents for answers about shipping, returns, and portal usage.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The specific question or topic to look up in documentation." }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "escalateToHuman",
      description: "Escalate the conversation to a human support agent and create a ticket.",
      parameters: {
        type: "object",
        properties: {
          issue:    { type: "string", description: "Full description of the customer's issue." },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Ticket priority." }
        },
        required: ["issue"]
      }
    }
  }
];

// ──────── HELPERS ──────────────────────────────────────────────
async function getEmbedding(text) {
  const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small", 
      input: text
    })
  });
  const data = await response.json();
  return data.data[0].embedding;
}
// ───────────────────────────────────────────────────────────────

async function runAgent({ message, history, customerEmail, customerName }, collections) {
  // Build message history in OpenAI format
  const messages = [
    { role: "system", content: NESTBOT_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: message }
  ];

  // Agentic loop: keep calling until the model returns a plain text response
  while (true) {
    let response;
    let data;

    try {
      // ── PRIMARY: OPENROUTER ──────────────────────────────────────────
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
          "X-Title": "NestBot",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openai/gpt-4o",
          messages,
          tools,
          tool_choice: "auto"
        })
      });

      // If OpenRouter is rate-limited (429) or fails, throw to trigger fallback
      if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`);
      data = await response.json();

    } catch (err) {
      console.warn("OpenRouter failed, switching to Groq fallback:", err.message);
      
      // ── SECONDARY: GROQ FALLBACK ─────────────────────────────────────
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
          messages,
          tools,
          tool_choice: "auto"
        })
      });

      if (!response.ok) throw new Error(`Fallback Error: ${response.status}`);
      data = await response.json();
    }

    const choice = data.choices[0];
    const assistantMessage = choice.message;

    // Append assistant turn to history
    messages.push(assistantMessage);

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return assistantMessage.content;
    }

    for (const toolCall of assistantMessage.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await executeTool(
        toolCall.function.name,
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
}

// Route tool call name → implementation
async function executeTool(name, args, collections) {
  const { paymentCollection, productCollection, contactCollection, knowledgeCollection } = collections;
  switch (name) {
    case "getOrderStatus":       return getOrderStatus({ ...args, paymentCollection });
    case "getTransactionHistory": return getTransactionHistory({ ...args, paymentCollection });
    case "requestRefund":        return requestRefund({ ...args, paymentCollection });
    case "checkInventory":       return checkInventory({ ...args, productCollection });
    case "searchKnowledgeBase":  return searchKnowledgeBase({ ...args, knowledgeCollection });
    case "escalateToHuman":      return escalateToHuman({ ...args, contactCollection });
    default: return { error: `Unknown tool: ${name}` };
  }
}

module.exports = { runAgent };
```

---

## Phase 3 — API Route

### File: `BizNest-server/routes/aiRoutes.js`

```javascript
const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { runAgent } = require('../services/agentService');

module.exports = (paymentCollection, productCollection, contactCollection, userCollection) => {

  // JWT Middleware — extracts customer identity
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
      next();
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // POST /ai/chat
  router.post('/chat', authenticate, async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      const { email: customerEmail, name: customerName } = req.user;

      const reply = await runAgent(
        { message, history, customerEmail, customerName },
        { paymentCollection, productCollection, contactCollection }
      );

      res.json({ reply });
    } catch (err) {
      console.error('NestBot error:', err);
      res.status(500).json({ error: 'NestBot encountered an error.' });
    }
  });

  return router;
};
```

---

## Phase 4 — Server Registration

### File: `BizNest-server/index.js`

Add the following inside the `run()` async function after existing route registrations:

```javascript
const aiAPI = require('./routes/aiRoutes')(
  paymentCollection,
  productCollection,
  contactCollection,
  userCollection
);
app.use('/ai', aiAPI);
```

---

## Phase 5 — Admin Dashboard Update

### New Section: "Refund Requests" Tab

- Query: `payments_details` where `refund_status: "refund_requested"`
- Show: Customer email, Order ID, Amount, Refund Reason, Requested Date
- Actions:
  - **✅ Approve**: Calls `stripe.refunds.create({ payment_intent: order.stripe_payment_intent_id })` → Sets `refund_status: "refund_approved"`
  - **❌ Reject**: Sets `refund_status: "refund_rejected"` with admin email + timestamp

### New Section: "Bot Escalations" Tab

- Query: `contact_messages` where `assignedTo: "bot_escalation"` and `status: "pending"`
- Admin can claim the ticket, reply, and mark as resolved.

---

## Phase 6 — Frontend Chat Widget

### File: `Biznest-client/src/components/ChatWidget/ChatWidget.jsx`

**UI Features:**
- Floating button in bottom-right corner with NestBot logo and "Online" pulse indicator.
- Chat window (360px × 520px) with message history.
- Typing indicator (three animated dots) while NestBot is thinking.
- Quick-reply chip buttons on first open:
  - "📦 Check my order"
  - "💸 Request a refund"
  - "📋 My transactions"
  - "🙋 Talk to a human"
- Message bubbles with timestamps.
- Conversation history stored in `useState` (session-based, passed as `history` to backend).

**API Call (using useAxiosSecure):**
```javascript
const axiosSecure = useAxiosSecure();

const response = await axiosSecure.post('/ai/chat', {
  message: userMessage,
  history: conversationHistory   // Full OpenAI-format history array
});
```

**Updating local history after each turn:**
```javascript
// After a successful response, append both turns to state
setConversationHistory(prev => [
  ...prev,
  { role: 'user',      content: userMessage },
  { role: 'assistant', content: response.data.reply }
]);
```

---

## Environment Variables

Add to `BizNest-server/.env`:

```env
# OpenRouter — Primary
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL=openai/gpt-4o

# Groq — Fallback (if OpenRouter hits limits)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.1-70b-versatile

# Your client's URL
CLIENT_URL=http://localhost:5173
```

> Get your free API key at: https://openrouter.ai/keys
> Browse all available models at: https://openrouter.ai/models

---

## Key Differences from Gemini Implementation

| Area | Gemini (Original) | OpenRouter (Updated) |
| :--- | :--- | :--- |
| SDK | `@google/generative-ai` npm package | Native `fetch` — no SDK needed |
| API endpoint | Google AI Studio endpoint | `https://openrouter.ai/api/v1/chat/completions` |
| Tool call format | Gemini `functionDeclarations` schema | OpenAI `tools` array format |
| Tool result format | `functionResponse` object | `role: "tool"` message with `tool_call_id` |
| History format | Gemini `startChat({ history })` | OpenAI messages array (stateless, passed each call) |
| Model switching | Locked to Gemini models | Any model on OpenRouter with one env var change |
| Auth header | API key via SDK config | `Authorization: Bearer` header |
| Required headers | None extra | `HTTP-Referer` and `X-Title` required by OpenRouter |

---

## Verification Checklist

- [ ] `Payment.js` has all 7 new refund fields
- [ ] `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` set in `.env`
- [ ] `APP_URL` set in `.env` (required HTTP-Referer header)
- [ ] `agentTools.js` — all 5 tools tested individually via Postman/unit test
- [ ] `agentService.js` — model responds correctly with a plain message
- [ ] `agentService.js` — model calls the correct tool for "Where is my order XYZ?"
- [ ] 7-day refund check triggers correctly for old orders
- [ ] `escalateToHuman` creates a document in `contact_messages`
- [ ] JWT verification rejects unauthenticated chat requests
- [ ] Chat widget renders + sends messages + correctly maintains history array
- [ ] Admin panel shows refund requests and escalation tickets
- [ ] Test model swap by changing `OPENROUTER_MODEL` env var (no code changes required)