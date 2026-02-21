const express = require('express');
const { ObjectId } = require('mongodb');
const verifyToken = require('../middlewares/verifyToken');

module.exports = (contactCollection) => {
    const router = express.Router();

    // POST endpoint for contact form submissions (Public)
    router.post('/contact', async (req, res) => {
        try {
            const { name, email, userType, issueCategory, subject, message } = req.body;
            
            // Validate required fields
            if (!name || !email || !issueCategory || !subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Please fill in all required fields'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

            // Create contact message object
            const contactMessage = {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                userEmail: email.toLowerCase().trim(), // Add userEmail for compatibility
                userType: userType || 'general',
                issueCategory,
                subject: subject.trim(),
                message: message.trim(),
                status: 'pending', // pending, in-progress, resolved
                priority: issueCategory === 'order-issue' || issueCategory === 'payment-problem' ? 'high' : 'normal',
                createdAt: new Date(),
                resolvedAt: null,
                reply: null,
                assignedTo: null,
                msgAdminStatus: false, // Admin has read the message
                msgClientStatus: false // Client has read the reply
            };

            // Insert contact message into database
            const result = await contactCollection.insertOne(contactMessage);

            if (result.insertedId) {
                res.status(201).json({
                    success: true,
                    message: 'Your message has been sent successfully! We will get back to you within 24 hours.',
                    messageId: result.insertedId
                });
            } else {
                throw new Error('Failed to save contact message');
            }

        } catch (error) {
            console.error('Error processing contact form:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error. Please try again later or contact us directly.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // GET endpoint to retrieve contact messages for logged in user
    router.get('/my-contacts', verifyToken, async (req, res) => {
        try {
            const email = req.decoded.email; // From token
            
            // Get contact messages for the specific email
            const messages = await contactCollection
                .find({ email: email.toLowerCase().trim() })
                .sort({ createdAt: -1 })
                .toArray();

            res.status(200).json({
                success: true,
                data: messages,
                count: messages.length
            });

        } catch (error) {
            console.error('Error fetching contact messages by email:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve contact messages',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PUT endpoint to toggle read status by client (Protected)
    router.put('/my-contacts/:id/toggle-read', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const userEmail = req.decoded.email;
            
            // Get current message status
            const currentMessage = await contactCollection.findOne({
                _id: new ObjectId(id),
                email: userEmail.toLowerCase().trim()
            });

            if (!currentMessage) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found or unauthorized'
                });
            }

            // Toggle read status
            const newReadStatus = !currentMessage.msgClientStatus;
            const updateData = {
                msgClientStatus: newReadStatus
            };

            // Add timestamp based on new status
            if (newReadStatus) {
                updateData.clientReadAt = new Date();
            } else {
                updateData.clientReadAt = null;
            }

            // Update message
            const result = await contactCollection.updateOne(
                { 
                    _id: new ObjectId(id),
                    email: userEmail.toLowerCase().trim()
                },
                { $set: updateData }
            );

            res.status(200).json({
                success: true,
                message: `Message marked as ${newReadStatus ? 'read' : 'unread'}`,
                isRead: newReadStatus
            });

        } catch (error) {
            console.error('Error toggling message read status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle message read status',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};
