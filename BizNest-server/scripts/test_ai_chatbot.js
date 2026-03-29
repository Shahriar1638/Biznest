const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET_TOKEN;
const API_URL = `http://localhost:${PORT}/ai/chat`;

async function callChatbot(message, history = []) {
  const mockUser = {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    email: 'testuser@example.com',
    name: 'Test Techie',
    role: { type: 'customer', details: { customerID: 'CUS001' } }
  };

  const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '1h' });

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, history })
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  console.log('🚀 Starting AI Chatbot API Tests...\n');

  // Test 1: General Greeting
  console.log('Test 1: General Greeting');
  const res1 = await callChatbot("Hi NestBot, who are you?");
  console.log('Status:', res1.status);
  console.log('Reply:', res1.data.success ? res1.data.reply : 'Error: ' + res1.data.message);
  console.log('-----------------------------------\n');

  // Test 2: Inventory Check (Tool Trigger)
  console.log('Test 2: Inventory Check (Should trigger checkInventory tool)');
  const res2 = await callChatbot("Do you have any Organic Bananas?");
  console.log('Status:', res2.status);
  console.log('Reply:', res2.data.success ? res2.data.reply : 'Error: ' + res2.data.message);
  console.log('-----------------------------------\n');

  // Test 3: Order Status (Tool Trigger)
  console.log('Test 3: Last Order Status (Should trigger findMyLastOrder tool)');
  const res3 = await callChatbot("What was the status of my last order?");
  console.log('Status:', res3.status);
  console.log('Reply:', res3.data.success ? res3.data.reply : 'Error: ' + res3.data.message);
  console.log('-----------------------------------\n');

  console.log('✅ AI Chatbot API Tests Completed.');
}

runTests().catch(err => console.error('Test Execution Failed:', err));
