const express = require('express');
const router = express.Router();

module.exports = (productCollection, userCollection) => {

    // Update product status - Admin only
    router.put('/products/status', async (req, res) => {
        try {
            const { productId, status, adminEmail } = req.body;

            // Validate required fields
            if (!productId || !status || !adminEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Product ID, status, and admin email are required'
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

            // Verify admin authorization
            const admin = await userCollection.findOne({ 
                email: adminEmail,
                'role.type': 'admin'
            });

            if (!admin) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: Admin access required'
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
    router.get('/products', async (req, res) => {
        try {
            const { adminEmail, status, page = 1, limit = 20 } = req.query;

            // Verify admin authorization
            if (adminEmail) {
                const admin = await userCollection.findOne({ 
                    email: adminEmail,
                    'role.type': 'admin'
                });

                if (!admin) {
                    return res.status(403).json({
                        success: false,
                        message: 'Unauthorized: Admin access required'
                    });
                }
            }

            // Build filter
            const filter = {};
            if (status && ['pending', 'released', 'rejected'].includes(status)) {
                filter.product_status = status;
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get products with pagination
            const products = await productCollection
                .find(filter)
                .sort({ product_publishdate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .toArray();

            // Get total count for pagination
            const totalProducts = await productCollection.countDocuments(filter);
            const totalPages = Math.ceil(totalProducts / parseInt(limit));

            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                data: products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
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

    return router;
};