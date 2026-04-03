const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifySeller = require('../middlewares/verifySeller');
const Product = require('../models/Product');

module.exports = (productCollection, userCollection) => {

// ----------------------------------------------> Get Seller Products Endpoint <------------------------------
  router.get('/my-products', verifyToken, verifySeller(userCollection), async (req, res) => {
    try {
      const sellerEmail = req.decoded.email;
      console.log('Fetching products for seller:', sellerEmail);

      // Find all products for this seller
      const sellerProducts = await productCollection.find({ selleremail: sellerEmail }).toArray();

      if (!sellerProducts || sellerProducts.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No products found for this seller',
          products: []
        });
      }

      // Return the products data
      res.status(200).json({
        success: true,
        message: 'Products fetched successfully',
        products: sellerProducts,
        count: sellerProducts.length
      });

    } catch (error) {
      console.error('Get seller products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Add Product Endpoint <------------------------------
  router.post('/addproduct', verifyToken, verifySeller(userCollection), async (req, res) => {
    try {
      const { productdetails } = req.body;
      const sellerEmail = req.decoded.email; // Get secure email
      console.log('Product details received:', productdetails);

      const tempProduct = new Product(productdetails);
      const validationError = tempProduct.validateSync();
      
      if (validationError) {
        return res.status(400).json({
          success: false,
          message: Object.values(validationError.errors).map(val => val.message).join(', ')
        });
      }

      // Add creation date to product details
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      // Add additional fields to product
      const productToInsert = new Product({
        ...productdetails,
        selleremail: sellerEmail, // Force secure email
        created_date: formattedDate,
        status: 'pending', // Default status for new products
        approved: false,
        product_status: 'pending' // Based on model schema
      });

      // Insert product into database
      const result = await productToInsert.save();

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        result,
        productId: result._id
      });

    } catch (error) {
      console.error('Add product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  return router;
};
