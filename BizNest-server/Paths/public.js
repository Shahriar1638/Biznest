const express = require('express');

module.exports = (contactCollection) => {
    const router = express.Router();

    // POST endpoint for contact form submissions
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

    // GET endpoint to retrieve contact messages by email
    router.get('/contacts/:email', async (req, res) => {
        try {
            const { email } = req.params;
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

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

    // GET endpoint to retrieve all contact messages (for admin use)
    router.get('/contact/all', async (req, res) => {
        try {
            const { status, priority, limit = 50, skip = 0 } = req.query;
            
            // Build filter object
            const filter = {};
            if (status) filter.status = status;
            if (priority) filter.priority = priority;

            // Get contact messages with optional filtering
            const messages = await contactCollection
                .find(filter)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .toArray();

            // Get total count for pagination
            const totalCount = await contactCollection.countDocuments(filter);

            res.status(200).json({
                success: true,
                data: messages,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    skip: parseInt(skip),
                    hasMore: (parseInt(skip) + parseInt(limit)) < totalCount
                }
            });

        } catch (error) {
            console.error('Error fetching contact messages:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve contact messages',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PUT endpoint to update contact message status (for admin use)
    router.put('/contact/:id/status', async (req, res) => {
        try {
            const { id } = req.params;
            const { status, reply, assignedTo } = req.body;
            
            // Validate status
            const validStatuses = ['pending', 'in-progress', 'resolved'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: pending, in-progress, resolved'
                });
            }

            // Build update object
            const updateData = {
                status,
                updatedAt: new Date()
            };

            if (reply) updateData.reply = reply.trim();
            if (assignedTo) updateData.assignedTo = assignedTo.trim();
            if (status === 'resolved') updateData.resolvedAt = new Date();

            // Update contact message
            const result = await contactCollection.updateOne(
                { _id: new require('mongodb').ObjectId(id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Contact message updated successfully'
            });

        } catch (error) {
            console.error('Error updating contact message:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update contact message',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PUT endpoint to mark message as read by client
    router.put('/contacts/:id/mark-read', async (req, res) => {
        try {
            const { id } = req.params;
            const { userEmail } = req.body;
            
            // Validate input
            if (!userEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'User email is required'
                });
            }

            // Update message to mark as read by client
            const result = await contactCollection.updateOne(
                { 
                    _id: new require('mongodb').ObjectId(id),
                    email: userEmail.toLowerCase().trim()
                },
                { 
                    $set: { 
                        msgClientStatus: true,
                        clientReadAt: new Date()
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found or unauthorized'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Message marked as read'
            });

        } catch (error) {
            console.error('Error marking message as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark message as read',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PUT endpoint to toggle read status by client
    router.put('/contacts/:id/toggle-read', async (req, res) => {
        try {
            const { id } = req.params;
            const { userEmail } = req.body;
            
            // Validate input
            if (!userEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'User email is required'
                });
            }

            // Get current message status
            const currentMessage = await contactCollection.findOne({
                _id: new require('mongodb').ObjectId(id),
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
                    _id: new require('mongodb').ObjectId(id),
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
