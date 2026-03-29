const { ObjectId } = require('mongodb');

/**
 * NestBot AI Support Tools
 * Implementation of functions called by the AI Agent.
 */

// Tool 1: PROACTIVE - Find the most recent order automatically
async function findMyLastOrder({ customerEmail, paymentCollection }) {
  try {
    console.log(`🛠️ Tool: findMyLastOrder | Email: "${customerEmail}"`);

    // Ensure the query handles potentially different case variations for emails
    const order = await paymentCollection.findOne(
      { email: { $regex: new RegExp(`^${customerEmail}$`, 'i') } },
      { sort: { payment_timestamp: -1 } }
    );

    if (!order) {
      return { error: "No orders found for your account." };
    }

    return {
      orderID: order.orderID,
      status: order.payment_status,
      amount: order.final_amount,
      date: order.payment_date,
      itemCount: order.itemcount || (order.items_name ? order.items_name.length : 0),
      items: order.items_name || [],
      refundStatus: order.refund_status || 'none',
      isLatestOrder: true
    };
  } catch (error) {
    console.error('Tool Error (findMyLastOrder):', error);
    return { error: "Failed to retrieve your last order." };
  }
}

// Tool 2: REACTIVE - Look up a specific order status by ID
async function getOrderStatus(args) {
  // Be defensive about property names (orderID vs orderid)
  const orderID = args.orderID || args.orderid || args.order_id;
  const customerEmail = args.customerEmail;
  const paymentCollection = args.paymentCollection;

  try {
    console.log(`🛠️ Tool: getOrderStatus | ID: "${orderID}" | Email: "${customerEmail}"`);

    if (!orderID) return { error: "Please provide a valid Order ID." };

    const order = await paymentCollection.findOne({
      orderID: { $regex: new RegExp(`^${orderID}$`, 'i') },
      email: { $regex: new RegExp(`^${customerEmail}$`, 'i') }
    });

    if (!order) {
      return { error: `Order ${orderID} not found or does not belong to this account.` };
    }

    return {
      orderID: order.orderID,
      status: order.payment_status,
      amount: order.final_amount,
      date: order.payment_date,
      itemCount: order.itemcount || (order.items_name ? order.items_name.length : 0),
      items: order.items_name || [],
      refundStatus: order.refund_status || 'none',
      isLatestOrder: false
    };
  } catch (error) {
    console.error('Tool Error (getOrderStatus):', error);
    return { error: "Failed to retrieve order status." };
  }
}

// Tool 3: List recent transactions
async function getTransactionHistory({ customerEmail, paymentCollection }) {
  try {
    const transactions = await paymentCollection
      .find({ email: { $regex: new RegExp(`^${customerEmail}$`, 'i') } })
      .sort({ payment_timestamp: -1 })
      .limit(10)
      .toArray();

    return transactions.map(t => ({
      orderID: t.orderID,
      date: t.payment_date,
      amount: t.final_amount,
      status: t.payment_status,
      refundStatus: t.refund_status || 'none',
      items: t.itemcount
    }));
  } catch (error) {
    console.error('Tool Error (getTransactionHistory):', error);
    return { error: "Failed to retrieve transaction history." };
  }
}

// Tool 4: Request a refund (7-day window check)
async function requestRefund({ orderID, reason, customerEmail, paymentCollection }) {
  try {
    const order = await paymentCollection.findOne({
      orderID: { $regex: new RegExp(`^${orderID}$`, 'i') },
      email: { $regex: new RegExp(`^${customerEmail}$`, 'i') }
    });

    if (!order) return { error: "Order not found." };

    const purchaseTimestamp = order.payment_timestamp;
    if (!purchaseTimestamp) return { error: "Purchase date missing. Please contact support." };

    const purchaseDate = new Date(purchaseTimestamp);
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const daysSincePurchase = (Date.now() - purchaseDate) / millisecondsInDay;

    if (daysSincePurchase > 7) {
      return {
        error: `Refund window expired. This order was placed ${Math.floor(daysSincePurchase)} days ago.`
      };
    }

    await paymentCollection.updateOne(
      { orderID: order.orderID },
      {
        $set: {
          refund_status: 'refund_requested',
          refund_requested_at: new Date(),
          refund_reason: reason
        }
      }
    );

    return { success: true, message: `Refund request for order ${orderID} has been submitted successfully.` };
  } catch (error) {
    console.error('Tool Error (requestRefund):', error);
    return { error: "Failed to process refund request." };
  }
}

// Tool 5: Check inventory availability
async function checkInventory({ productName, productCollection }) {
  try {
    const products = await productCollection
      .find({ product_name: { $regex: new RegExp(productName, 'i') } })
      .toArray();

    if (!products.length) return { error: `No products found matching "${productName}".` };

    return products.map(p => ({
      name: p.product_name,
      category: p.category,
      units: p.quantity_description.map(u => ({
        type: u.unit_type,
        price: u.unit_price,
        available: u.unit_quantity > 0 ? 'In Stock' : 'Out of Stock'
      }))
    }));
  } catch (error) {
    console.error('Tool Error (checkInventory):', error);
    return { error: "Failed to check inventory." };
  }
}

// Tool 6: Escalate to a human support agent
async function escalateToHuman({ issue, priority = 'high', customerEmail, customerName, contactCollection }) {
  try {
    const ticket = {
      name: customerName,
      email: customerEmail,
      userType: 'customer',
      issueCategory: 'Bot Escalation',
      subject: `[NestBot Escalation] ${issue.substring(0, 80)}`,
      message: issue,
      status: 'pending',
      priority: priority,
      createdAt: new Date()
    };

    const result = await contactCollection.insertOne(ticket);

    return {
      success: true,
      ticketId: result.insertedId.toString(),
      message: "I've connected you with our support team. Please check your dashboard later."
    };
  } catch (error) {
    console.error('Tool Error (escalateToHuman):', error);
    return { error: "Failed to create support ticket." };
  }
}

// Tool 7: Search knowledge base (RAG)
async function searchKnowledgeBase({ query, knowledgeCollection }) {
  try {
    const results = await knowledgeCollection.find({
      $text: { $search: query }
    }).limit(3).toArray();

    if (!results.length) return { message: "No specific FAQ found." };

    return results.map(r => ({ topic: r.topic, content: r.content }));
  } catch (error) {
    console.error('Tool Error (searchKnowledgeBase):', error);
    return { error: "Knowledge base unavailable." };
  }
}

module.exports = {
  findMyLastOrder,
  getOrderStatus,
  getTransactionHistory,
  requestRefund,
  checkInventory,
  escalateToHuman,
  searchKnowledgeBase
};
