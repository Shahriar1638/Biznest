const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { runAgent } = require('../services/agentService');

/**
 * NestBot AI Chat Route
 * POST /ai/chat
 */
module.exports = (paymentCollection, productCollection, contactCollection, knowledgeCollection) => {

  router.post('/chat', verifyToken, async (req, res) => {
    try {
      const { message, history } = req.body;
      const userEmail = req.decoded.email;
      const userName = req.decoded.name || 'Customer';

      console.log(`\n🤖 --- AI REQUEST ---`);
      console.log(`👤 User: ${userEmail}`);
      console.log(`💬 Msg: ${message}`);

      if (!message) {
        return res.status(400).json({ success: false, message: "No message provided." });
      }

      // Prepare database collections for the agent
      const collections = {
        paymentCollection,
        productCollection,
        contactCollection,
        knowledgeCollection
      };

      // Call the AI Agent
      const aiReply = await runAgent(
        {
          message,
          history: history || [],
          customerEmail: userEmail,
          customerName: userName
        },
        collections
      );

      res.status(200).json({
        success: true,
        reply: aiReply
      });

    } catch (error) {
      console.error('AI Route Error:', error);
      res.status(500).json({
        success: false,
        message: "NestBot is having some trouble. Please try again later."
      });
    }
  });

  return router;
};
