const express = require('express');
const router = express.Router();

module.exports = (productCollection) => {

// ----------------------------------------------> Featured Products (Top 8 Best Sellers) <------------------------------
  router.get('/featured', async (req, res) => {
    try {
      // Get top 8 released products sorted by sell_count.length in descending order
      const featuredProducts = await productCollection
        .aggregate([
          {
            $match: { product_status: "released" }
          },
          {
            $addFields: {
              sellCountLength: { $size: { $ifNull: ["$sell_count", []] } }
            }
          },
          {
            $sort: { sellCountLength: -1 }
          },
          {
            $limit: 8
          },
          {
            $project: {
              sellCountLength: 0 // Remove the temporary field from output
            }
          }
        ])
        .toArray();

      res.status(200).json(featuredProducts);

    } catch (error) {
      console.error('Featured products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Search Products <------------------------------
  router.post('/search', async (req, res) => {
    try {
      const { searchinfo } = req.body;
      
      if (!searchinfo) {
        return res.status(400).json({
          success: false,
          message: 'Search info is required'
        });
      }

      const { text, category } = searchinfo;
      
      // Build search query
      let searchQuery = { product_status: "released" }; // Only search released products
      
      // Add text search if provided
      if (text && text.trim()) {
        searchQuery.product_name = { 
          $regex: new RegExp(text.trim(), 'i') // Case-insensitive search in product name
        };
      }
      
      // Add category filter if provided
      if (category && category.trim()) {
        searchQuery.category = { 
          $regex: new RegExp(category.trim(), 'i') // Case-insensitive category search
        };
      }

      // Execute search
      const searchResults = await productCollection
        .find(searchQuery)
        .sort({ product_publishdate: -1 }) // Sort by newest first
        .toArray();

      res.status(200).json({
        success: true,
        message: `Found ${searchResults.length} products`,
        data: searchResults,
        count: searchResults.length
      });

    } catch (error) {
      console.error('Product search error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during search',
        error: error.message
      });
    }
  });

// ----------------------------------------------> Get All Products <------------------------------
  router.get('/allproducts', async (req, res) => {
    try {
      // Get all products from the collection
      const allProducts = await productCollection.find({}).toArray();

      res.status(200).json(allProducts);

    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Get Released Products Only <------------------------------
  router.get('/released-products', async (req, res) => {
    try {
      // Get all products with product_status: "released"
      const releasedProducts = await productCollection.find({ 
        product_status: "released" 
      }).toArray();

      res.status(200).json(releasedProducts);

    } catch (error) {
      console.error('Get released products error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Get Products by Status Filter <------------------------------
  router.get('/filter/:filter', async (req, res) => {
    try {
      const { filter } = req.params;
      
      // Validate filter parameter - should be one of: pending, rejected, released
      const validFilters = ['pending', 'rejected', 'released'];
      
      if (!validFilters.includes(filter.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid filter. Valid filters are: ${validFilters.join(', ')}`
        });
      }
      
      // Get products filtered by product_status
      const filteredProducts = await productCollection.find({ 
        product_status: filter.toLowerCase()
      }).toArray();

      res.status(200).json({
        success: true,
        message: `${filter.charAt(0).toUpperCase() + filter.slice(1)} products fetched successfully`,
        products: filteredProducts,
        count: filteredProducts.length
      });

    } catch (error) {
      console.error(`Get ${filter} products error:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Get Products by Category <------------------------------
  router.get('/:category', async (req, res) => {
    try {
      const { category } = req.params;
      
      // Get products filtered by category
      const categoryProducts = await productCollection.find({ 
        category: { $regex: new RegExp(category, 'i') } // Case-insensitive search
      }).toArray();

      res.status(200).json(categoryProducts);

    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  return router;
};