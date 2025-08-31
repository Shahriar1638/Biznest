const express = require('express');
const router = express.Router();

module.exports = (productCollection) => {

// ----------------------------------------------> Featured Products (Top 8 Best Sellers) <------------------------------
  router.get('/featured', async (req, res) => {
    try {
      // Get top 8 products sorted by sell_count.length in descending order
      const featuredProducts = await productCollection
        .aggregate([
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

  return router;
};