const express = require('express');
const router = express.Router();

module.exports = (productCollection, userCollection) => {

  // ----------------------------------------------> Get Seller Products Endpoint <------------------------------
  router.get('/myproducts/:email', async (req, res) => {
    try {
      const sellerEmail = req.params.email;
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
  router.post('/addproduct', async (req, res) => {
    try {
      const { productdetails } = req.body;
      console.log('Product details received:', productdetails);

      const Joi = require('joi');
      const productSchema = Joi.object({
        product_name: Joi.string().required(),
        product_description: Joi.string().required(),
        product_price: Joi.number().positive().required(),
        product_quantity: Joi.number().integer().min(0).required(),
        category: Joi.string().required(),
        // Add other fields as necessary based on your data model
      }).unknown(true); // Allow other fields for now to prevent breaking changes

      const { error } = productSchema.validate(productdetails);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // Add creation date to product details
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      // Add additional fields to product
      const productToInsert = {
        ...productdetails,
        created_date: formattedDate,
        status: 'pending', // Default status for new products
        approved: false
      };

      // Insert product into database
      const result = await productCollection.insertOne(productToInsert);

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        result,
        productId: result.insertedId
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