const express = require('express');
const router = express.Router();

module.exports = (cartCollection) => {

// ----------------------------------------------> Cart API Endpoint <------------------------------
  router.post('/cart', async (req, res) => {
    try {
      const UseCart = req.body;
      console.log('Cart data received:', UseCart);
      
      // Add current date as added_date in dd-mm-yyyy format
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      const { customeremail, selleremail, unitid, productId, unitquantity } = UseCart;
      
      // Check if cart already exists for this customer
      const existingCart = await cartCollection.findOne({ customeremail });
      
      if (existingCart) {
        // Check if product with same unitid already exists in cart
        const existingItemIndex = existingCart.cart_details.findIndex(
          item => item.productId === productId && item.unitid === unitid
        );
        
        if (existingItemIndex !== -1) {
          // Product with same unitid exists, increment unitquantity
          const newQuantity = parseInt(existingCart.cart_details[existingItemIndex].unitquantity) + parseInt(unitquantity);
          
          const result = await cartCollection.updateOne(
            { 
              customeremail,
              "cart_details.productId": productId,
              "cart_details.unitid": unitid
            },
            {
              $set: {
                "cart_details.$.unitquantity": newQuantity,
                "cart_details.$.added_date": formattedDate
              }
            }
          );
          
          res.status(200).json({
            success: true,
            message: 'Cart item quantity updated successfully',
            result
          });
        } else {
          // Product doesn't exist, add new item to cart_details
          const newCartItem = {
            unitid,
            selleremail,
            productId,
            unitquantity: parseInt(unitquantity),
            added_date: formattedDate
          };
          
          const result = await cartCollection.updateOne(
            { customeremail },
            {
              $push: {
                cart_details: newCartItem
              }
            }
          );
          
          res.status(200).json({
            success: true,
            message: 'New item added to existing cart successfully',
            result
          });
        }
      } else {
        // No cart exists for this customer, create new cart
        const newCart = {
          customeremail,
          cart_details: [
            {
              unitid,
              selleremail,
              productId,
              unitquantity: parseInt(unitquantity),
              added_date: formattedDate
            }
          ]
        };
        
        const result = await cartCollection.insertOne(newCart);
        
        res.status(201).json({
          success: true,
          message: 'New cart created successfully',
          result
        });
      }
      
    } catch (error) {
      console.error('Cart API error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Get User Cart Endpoint <------------------------------
  router.get('/:email/showcart', async (req, res) => {
    try {
      const customerEmail = req.params.email;
      console.log('Fetching cart for user:', customerEmail);
      
      // Find cart for this customer
      const userCart = await cartCollection.findOne({ customeremail: customerEmail });
      
      if (!userCart) {
        return res.status(404).json({
          success: false,
          message: 'No cart found for this user',
          cart: null
        });
      }
      
      // Return the cart data
      res.status(200).json({
        success: true,
        message: 'Cart fetched successfully',
        userCart
      });
      
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  return router;
};