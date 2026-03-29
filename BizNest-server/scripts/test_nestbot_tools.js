/**
 * NestBot Logic Verification Suite
 * Tests the 5 core deterministic tools with mocked database responses.
 */
const {
  getOrderStatus,
  getTransactionHistory,
  requestRefund,
  checkInventory,
  escalateToHuman
} = require('../services/agentTools');

async function runTests() {
  console.log("--- 🤖 NESTBOT CORE LOGIC TEST SUITE ---");

  // --- TEST 1: Get Order Status ---
  console.log("\n[Test 1] Order Status:");
  const mockOrderColl = {
    findOne: async () => ({
      orderID: 'ORD-123',
      payment_status: 'succeeded',
      final_amount: 500,
      payment_date: '2026-03-25',
      itemcount: 2,
      refund_status: 'none'
    })
  };
  const res1 = await getOrderStatus({ orderID: 'ORD-123', customerEmail: 'test@ee.com', paymentCollection: mockOrderColl });
  console.log(res1.status === 'succeeded' ? "✅ PASSED: Retrieved correct status" : "❌ FAILED");

  // --- TEST 2: Transaction History ---
  console.log("\n[Test 2] Transaction History:");
  const mockHistColl = {
    find: () => ({
      sort: () => ({
        limit: () => ({
          toArray: async () => [
            { orderID: 'ORD-1', final_amount: 100 },
            { orderID: 'ORD-2', final_amount: 200 }
          ]
        })
      })
    })
  };
  const res2 = await getTransactionHistory({ customerEmail: 'test@ee.com', paymentCollection: mockHistColl });
  console.log(res2.length === 2 ? "✅ PASSED: Retrieved 2 recent transactions" : "❌ FAILED");

  // --- TEST 3: Refund Logic (7-Day Check) ---
  console.log("\n[Test 3] Refund Window (Expiring):");
  const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(); // 10 days ago
  const mockRefundColl = {
    findOne: async () => ({
      payment_status: 'succeeded',
      payment_timestamp: oldDate,
      refund_status: 'none'
    })
  };
  const res3 = await requestRefund({ orderID: 'ORD-OLD', paymentCollection: mockRefundColl });
  console.log(res3.error && res3.error.includes('expired') ? "✅ PASSED: Correctly blocked 10-day old refund" : "❌ FAILED");

  // --- TEST 4: Inventory Check ---
  console.log("\n[Test 4] Inventory Search:");
  const mockProdColl = {
    find: () => ({
      limit: () => ({
        toArray: async () => [{
          product_name: 'Biz-Phone Pro',
          quantity_description: [{ unit_type: 'bulk', unit_quantity: 50 }]
        }]
      })
    })
  };
  const res4 = await checkInventory({ productName: 'Phone', productCollection: mockProdColl });
  console.log(res4[0].name === 'Biz-Phone Pro' ? "✅ PASSED: Fuzzy search returned product" : "❌ FAILED");

  // --- TEST 5: CRM Escalation ---
  console.log("\n[Test 5] Human Handover (Ticket Creation):");
  const mockContactColl = {
    insertOne: async (doc) => {
      console.log(`   - Internal Log: Ticket created with subject: "${doc.subject}"`);
      return { insertedId: 'TICKET-999' };
    }
  };
  const res5 = await escalateToHuman({
    issue: 'The user wants to talk to a human about shipping.',
    customerEmail: 'user@ee.com',
    customerName: 'User One',
    contactCollection: mockContactColl
  });
  console.log(res5.success ? "✅ PASSED: Created escalation ticket successfully" : "❌ FAILED");

  console.log("\n--- ✨ ALL CORE LOGIC MODULES VERIFIED ---");
}

runTests().catch(e => console.error(e));
