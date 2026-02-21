const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

module.exports = (productCollection, userCollection, contactCollection) => {

    // Update product status - Admin only
    router.put('/products/status', verifyToken, verifyAdmin(userCollection), async (req, res) => {
        try {
            const { productId, status } = req.body;
            const adminEmail = req.decoded.email; // Get email from token

            // Validate required fields
            if (!productId || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID and status are required'
                });
            }

            // Validate status values
            const validStatuses = ['pending', 'released', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            // Check if product exists
            const existingProduct = await productCollection.findOne({ productId });
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Update product status
            const updateResult = await productCollection.updateOne(
                { productId },
                { 
                    $set: { 
                        product_status: status,
                        statusUpdatedAt: new Date(),
                        statusUpdatedBy: adminEmail
                    }
                }
            );

            if (updateResult.modifiedCount === 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update product status'
                });
            }

            // Get updated product for response
            const updatedProduct = await productCollection.findOne({ productId });

            res.status(200).json({
                success: true,
                message: `Product status updated to '${status}' successfully`,
                data: {
                    productId: updatedProduct.productId,
                    productName: updatedProduct.product_name,
                    previousStatus: existingProduct.product_status,
                    newStatus: updatedProduct.product_status,
                    updatedAt: updatedProduct.statusUpdatedAt,
                    updatedBy: updatedProduct.statusUpdatedBy
                }
            });

        } catch (error) {
            console.error('Error updating product status:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while updating product status',
                error: error.message
            });
        }
    });

    // Get all products for admin review
    router.get('/products', verifyToken, verifyAdmin(userCollection), async (req, res) => {
        try {
            const { status } = req.query;

            // Build filter
            const filter = {};
            if (status && ['pending', 'released', 'rejected'].includes(status)) {
                filter.product_status = status;
            }

            // Get all products, sorted by publish date (newest first)
            const products = await productCollection
                .find(filter)
                .sort({ product_publishdate: -1 })
                .toArray();

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: products,
                totalProducts: products.length
            });

        } catch (error) {
            console.error('Error fetching products for admin:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching products',
                error: error.message
            });
        }
    });

    // Get all contact messages for admin review
    router.get('/contacts', verifyToken, verifyAdmin(userCollection), async (req, res) => {
        try {
            const { status } = req.query;

            // Build filter
            const filter = {};
            if (status && ['pending', 'in-progress', 'resolved'].includes(status)) {
                filter.status = status;
            }

            // Get all contact messages, sorted by creation date (newest first)
            const contacts = await contactCollection
                .find(filter)
                .sort({ createdAt: -1 })
                .toArray();

            res.status(200).json({
                success: true,
                message: 'Contact messages retrieved successfully',
                data: contacts,
                totalContacts: contacts.length
            });

        } catch (error) {
            console.error('Error fetching contact messages for admin:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching contact messages',
                error: error.message
            });
        }
    });

    // Reply to contact message - Admin only
    router.put('/contacts/reply', verifyToken, verifyAdmin(userCollection), async (req, res) => {
        try {
            const { messageId, reply } = req.body;
            const adminEmail = req.decoded.email;

            // Validate required fields
            if (!messageId || !reply) {
                return res.status(400).json({
                    success: false,
                    message: 'Message ID and reply are required'
                });
            }

            // Check if contact message exists
            const { ObjectId } = require('mongodb');
            const existingMessage = await contactCollection.findOne({ _id: new ObjectId(messageId) });
            if (!existingMessage) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            // Update contact message with reply
            const updateResult = await contactCollection.updateOne(
                { _id: new ObjectId(messageId) },
                { 
                    $set: { 
                        reply: reply,
                        status: 'resolved',
                        resolvedAt: new Date(),
                        resolvedBy: adminEmail
                    }
                }
            );

            if (updateResult.modifiedCount === 0) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update contact message with reply'
                });
            }

            // Get updated message for response
            const updatedMessage = await contactCollection.findOne({ _id: new ObjectId(messageId) });

            res.status(200).json({
                success: true,
                message: 'Reply sent successfully',
                data: {
                    messageId: updatedMessage._id,
                    userEmail: updatedMessage.userEmail,
                    subject: updatedMessage.subject,
                    reply: updatedMessage.reply,
                    status: updatedMessage.status,
                    resolvedAt: updatedMessage.resolvedAt,
                    resolvedBy: updatedMessage.resolvedBy
                }
            });

        } catch (error) {
            console.error('Error replying to contact message:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while sending reply',
                error: error.message
            });
        }
    });

    // Mark contact message as read by admin
    router.put('/contacts/:id/mark-read', verifyToken, verifyAdmin(userCollection), async (req, res) => {
        try {
            const { id } = req.params;

            // Update message to mark as read by admin
            const { ObjectId } = require('mongodb');
            const result = await contactCollection.updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        msgAdminStatus: true,
                        adminReadAt: new Date()
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Message marked as read by admin'
            });

        } catch (error) {
            console.error('Error marking admin message as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark message as read',
                error: error.message
            });
        }
    });

    // Toggle read/unread status for contact message - Admin only
    router.put('/contacts/:id/toggle-read', verifyToken, verifyAdmin(userCollection), async (req, res) => {
        try {
            const { id } = req.params;

            // Get current message to toggle status
            const { ObjectId } = require('mongodb');
            const currentMessage = await contactCollection.findOne({ _id: new ObjectId(id) });
            
            if (!currentMessage) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            // Toggle the read status
            const newStatus = !currentMessage.msgAdminStatus;
            const updateData = {
                msgAdminStatus: newStatus
            };

            // Add timestamp based on status
            if (newStatus) {
                updateData.adminReadAt = new Date();
            } else {
                updateData.$unset = { adminReadAt: 1 };
            }

            // Update message with toggled status
            const result = await contactCollection.updateOne(
                { _id: new ObjectId(id) },
                newStatus ? { $set: updateData } : { $set: { msgAdminStatus: false }, $unset: { adminReadAt: 1 } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            res.status(200).json({
                success: true,
                message: `Message marked as ${newStatus ? 'read' : 'unread'}`,
                data: {
                    messageId: id,
                    msgAdminStatus: newStatus,
                    adminReadAt: newStatus ? new Date() : null
                }
            });

        } catch (error) {
            console.error('Error toggling message read status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle message read status',
                error: error.message
            });
        }
    });

    return router;
};