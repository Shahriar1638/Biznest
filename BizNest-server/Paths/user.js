const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

module.exports = (cartCollection, paymentCollection, productCollection, userCollection) => {

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
        // Check if product with same productId already exists in cart
        const existingItemIndex = existingCart.cart_details.findIndex(
          item => item.productId === productId
        );
        console.log('Existing item index:', existingItemIndex);
        if (existingItemIndex !== -1) {
          // Product exists, increment unitquantity
          const newQuantity = parseInt(existingCart.cart_details[existingItemIndex].unitquantity) + parseInt(unitquantity);
          console.log('New quantity:', newQuantity);
          const result = await cartCollection.updateOne(
            { 
              customeremail,
              "cart_details.productId": productId
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

// ----------------------------------------------> Update Cart Item Quantity Endpoint <------------------------------
  router.put('/cart/update-quantity', async (req, res) => {
    try {
      const { customeremail, productId, newQuantity } = req.body;
      console.log('Update quantity request:', { customeremail, productId, newQuantity });
      
      // Validate newQuantity
      if (!newQuantity || newQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity. Quantity must be greater than 0'
        });
      }
      
      // Update current date
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      console.log('new quantity:', newQuantity);
      // Update the specific cart item quantity based on customeremail and productId only
      const result = await cartCollection.updateOne(
        { 
          customeremail,
          "cart_details.productId": productId
        },
        {
          $set: {
            "cart_details.$.unitquantity": parseInt(newQuantity),
            "cart_details.$.added_date": formattedDate
          }
        }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }
      
      if (result.modifiedCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'No changes made to cart item'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Cart item quantity updated successfully',
        result
      });
      
    } catch (error) {
      console.error('Update cart quantity error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Remove Cart Item Endpoint <------------------------------
  router.delete('/cart/remove-item', async (req, res) => {
    try {
      const { customeremail, productId } = req.body;
      console.log('Remove item request:', { customeremail, productId });
      
      // Remove the specific cart item based on customeremail and productId only
      const result = await cartCollection.updateOne(
        { customeremail },
        {
          $pull: {
            cart_details: {
              productId: productId
            }
          }
        }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found for this customer'
        });
      }
      
      if (result.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cart item not found'
        });
      }
      
      // Check if cart is now empty and optionally remove the entire cart document
      const updatedCart = await cartCollection.findOne({ customeremail });
      if (updatedCart && updatedCart.cart_details.length === 0) {
        // Optionally remove the entire cart document if empty
        await cartCollection.deleteOne({ customeremail });
        
        return res.status(200).json({
          success: true,
          message: 'Cart item removed successfully. Cart was empty so it was deleted.',
          cartDeleted: true
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Cart item removed successfully',
        result
      });
      
    } catch (error) {
      console.error('Remove cart item error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Process Payment Endpoint <------------------------------
  router.post('/process-payment', async (req, res) => {
    try {
      const paymentData = req.body;
      console.log('Payment data received:', paymentData);
      
      // Extract payment method and amount for Stripe
      const { paymentMethodId, payment_amount } = paymentData;
      
      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          message: 'Payment method is required'
        });
      }
      
      // 1. Loop through cart items and calculate prices
      let calculatedTotal = 0;
      if (paymentData.cartitems && paymentData.cartitems.length > 0) {
        console.log('Processing cart items for price calculation...');
        
        for (let i = 0; i < paymentData.cartitems.length; i++) {
          const cartItem = paymentData.cartitems[i];
          console.log(`Processing item ${i + 1}: ProductID ${cartItem.productid}`);
          
          // 2. Search for corresponding product from product collection via productId
          const product = await productCollection.findOne({ productId: cartItem.productid });
          
          if (product) {
            console.log(`Product found: ${product.product_name}`);
            
            // 3. Find the unit details and calculate price with quantity
            if (product.quantity_description && product.quantity_description.length > 0) {
              // Find the specific unit by unitId
              const unitDetails = product.quantity_description.find(
                unit => unit.unitid === cartItem.unitId
              );
              
              if (unitDetails && unitDetails.unit_price) {
                // Calculate total price = unit_price * quantity
                const totalPrice = unitDetails.unit_price * cartItem.quantity;
                
                // Subtract the purchased quantity from product's available quantity
                const newUnitQuantity = unitDetails.unit_quantity - cartItem.quantity;
                
                // Set quantity to 0 if it would go below 0, don't go negative
                const finalUnitQuantity = newUnitQuantity < 0 ? 0 : newUnitQuantity;
                
                // Update the product's unit quantity in the database
                await productCollection.updateOne(
                  { 
                    productId: cartItem.productid,
                    "quantity_description.unitid": cartItem.unitId
                  },
                  {
                    $set: {
                      "quantity_description.$.unit_quantity": finalUnitQuantity
                    }
                  }
                );
                
                console.log(`Quantity updated for ${product.product_name}: ${unitDetails.unit_quantity} -> ${finalUnitQuantity}`);
                if (newUnitQuantity < 0) {
                  console.log(`Note: Quantity was set to 0 (would have been ${newUnitQuantity})`);
                }
                console.log(`Price calculated for ${product.product_name}: ${unitDetails.unit_price} x ${cartItem.quantity} = ${totalPrice}`);
                
                // Update seller's revenue
                const sellerEmail = product.selleremail;
                console.log(`Updating revenue for seller: ${sellerEmail}, adding: ${totalPrice}`);
                
                // Find the seller and update their revenue
                const sellerUpdateResult = await userCollection.updateOne(
                  { 
                    email: sellerEmail,
                    "role.type": "seller"
                  },
                  {
                    $inc: {
                      "role.details.revenue": totalPrice
                    }
                  }
                );
                
                if (sellerUpdateResult.matchedCount > 0) {
                  console.log(`Revenue updated successfully for seller: ${sellerEmail}`);
                } else {
                  console.log(`Warning: Seller not found or not a seller: ${sellerEmail}`);
                }
              } else {
                console.log(`Unit details not found for unitId: ${cartItem.unitId} in product: ${cartItem.productid}`);
                // Keep price as 0 if unit not found
                paymentData.cartitems[i].price = 0;
              }
            } else {
              console.log(`No quantity_description found for product: ${cartItem.productid}`);
              paymentData.cartitems[i].price = 0;
            }
          } else {
            console.log(`Product not found for productId: ${cartItem.productid}`);
            // Keep price as 0 if product not found
            paymentData.cartitems[i].price = 0;
          }
        }
        
        console.log('Updated cart items with calculated prices:', paymentData.cartitems);
        console.log('Calculated total from products:', calculatedTotal);
      }
      
      // Verify the calculated total matches the payment amount (optional validation)
      const amountWithShipping = calculatedTotal + 50; // Adding shipping cost
      if (Math.abs(amountWithShipping - payment_amount) > 0.01) {
        console.log(`Warning: Amount mismatch. Calculated: ${amountWithShipping}, Received: ${payment_amount}`);
      }
      
      // Process Stripe Payment
      console.log('Creating Stripe payment intent...');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(payment_amount * 100), // Convert to cents
        currency: 'bdt',
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success`,
        metadata: {
          orderID: paymentData.orderID,
          customerEmail: paymentData.customer_email,
          itemCount: paymentData.itemcount.toString()
        }
      });
      
      console.log('Stripe payment intent created:', paymentIntent.id);
      
      // Add payment processing timestamp
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      const timestamp = currentDate.toISOString();
      
      // Create payment record with all the data including Stripe information
      const paymentRecord = {
        ...paymentData,
        payment_date: formattedDate,
        payment_timestamp: timestamp,
        payment_status: paymentIntent.status, // 'succeeded', 'requires_action', etc.
        transaction_id: paymentIntent.id, // Main transaction ID for easy reference
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_method_id: paymentMethodId,
        calculated_total: calculatedTotal,
        final_amount: payment_amount
      };
      
      // Insert payment record into database
      const result = await paymentCollection.insertOne(paymentRecord);
      
      // Handle different payment statuses
      if (paymentIntent.status === 'succeeded') {
        // Clear purchased items from cart after successful payment
        console.log('Payment succeeded, removing purchased items from cart...');
        
        // Remove each purchased item from the customer's cart
        for (const cartItem of paymentData.cartitems) {
          const removeResult = await cartCollection.updateOne(
            { customeremail: paymentData.customer_email },
            {
              $pull: {
                cart_details: {
                  productId: cartItem.productid
                }
              }
            }
          );
          
          if (removeResult.modifiedCount > 0) {
            console.log(`Removed product ${cartItem.productid} from cart`);
          } else {
            console.log(`Product ${cartItem.productid} not found in cart or already removed`);
          }
        }
        
        // Check if cart is now empty and remove the entire cart document if needed
        const updatedCart = await cartCollection.findOne({ customeremail: paymentData.customer_email });
        if (updatedCart && updatedCart.cart_details.length === 0) {
          await cartCollection.deleteOne({ customeremail: paymentData.customer_email });
          console.log(`Cart completely cleared for customer: ${paymentData.customer_email}`);
        }
        
        res.status(201).json({
          success: true,
          message: 'Payment processed successfully',
          paymentId: result.insertedId,
          transactionId: paymentIntent.id, // Return transaction ID to frontend
          stripePaymentIntentId: paymentIntent.id,
          paymentStatus: paymentIntent.status,
          processedCartItems: paymentData.cartitems,
          cartCleared: true,
          result
        });
      } else if (paymentIntent.status === 'requires_action') {
        res.status(200).json({
          success: false,
          requiresAction: true,
          message: 'Payment requires additional authentication',
          paymentIntentClientSecret: paymentIntent.client_secret,
          paymentStatus: paymentIntent.status
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment failed',
          paymentStatus: paymentIntent.status,
          error: paymentIntent.last_payment_error?.message || 'Unknown error'
        });
      }
      
    } catch (error) {
      console.error('Process payment error:', error);
      
      // Handle Stripe-specific errors
      if (error.type === 'StripeCardError') {
        res.status(400).json({
          success: false,
          message: 'Card error: ' + error.message,
          error_type: 'card_error'
        });
      } else if (error.type === 'StripeInvalidRequestError') {
        res.status(400).json({
          success: false,
          message: 'Invalid request: ' + error.message,
          error_type: 'invalid_request'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error during payment processing',
          error: error.message
        });
      }
    }
  });

// ----------------------------------------------> Get Payment History Endpoint <------------------------------
  router.get('/paymenthistory/:email', async (req, res) => {
    try {
      const customerEmail = req.params.email;
      console.log('Fetching payment history for user:', customerEmail);
      
      // Find all payments for this customer, sorted by date (newest first)
      const paymentHistory = await paymentCollection.find({ 
        customer_email: customerEmail 
      }).sort({ payment_timestamp: -1 }).toArray();
      
      if (!paymentHistory || paymentHistory.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No payment history found for this user',
          payments: []
        });
      }
      
      // Return the payment history
      res.status(200).json({
        success: true,
        message: 'Payment history fetched successfully',
        payments: paymentHistory,
        totalOrders: paymentHistory.length
      });
      
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Add/Remove Wishlist Item Endpoint <------------------------------
  router.post('/addwishlist/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const userEmail = req.body.userEmail || req.user?.email; // Get from body or JWT token
      
      console.log('Wishlist request for product:', productId, 'by user:', userEmail);
      
      if (!userEmail) {
        return res.status(400).json({
          success: false,
          message: 'User email is required'
        });
      }
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }
      
      // Find the user
      const user = await userCollection.findOne({ email: userEmail });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is a customer
      if (user.role.type !== 'customer') {
        return res.status(403).json({
          success: false,
          message: 'Only customers can have wishlists'
        });
      }
      
      // Check if product exists
      const product = await productCollection.findOne({ productId });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Initialize wishlist if it doesn't exist
      const currentWishlist = user.role.details.wishlist || [];
      
      // Check if product is already in wishlist
      const isProductInWishlist = currentWishlist.includes(productId);
      
      let updatedWishlist;
      let action;
      
      if (isProductInWishlist) {
        // Remove from wishlist
        updatedWishlist = currentWishlist.filter(id => id !== productId);
        action = 'removed';
      } else {
        // Add to wishlist
        updatedWishlist = [...currentWishlist, productId];
        action = 'added';
      }
      
      // Update user's wishlist
      const result = await userCollection.updateOne(
        { email: userEmail },
        {
          $set: {
            "role.details.wishlist": updatedWishlist
          }
        }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Failed to update user wishlist'
        });
      }
      
      res.status(200).json({
        success: true,
        message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist successfully`,
        action: action,
        productId: productId,
        wishlistCount: updatedWishlist.length,
        wishlist: updatedWishlist
      });
      
    } catch (error) {
      console.error('Add/Remove wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

// ----------------------------------------------> Get User Wishlist Endpoint <------------------------------
  router.get('/wishlist/:email', async (req, res) => {
    try {
      const userEmail = req.params.email;
      console.log('Fetching wishlist for user:', userEmail);
      
      // Find the user
      const user = await userCollection.findOne({ email: userEmail });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if user is a customer
      if (user.role.type !== 'customer') {
        return res.status(403).json({
          success: false,
          message: 'Only customers can have wishlists'
        });
      }
      
      // Get wishlist product IDs
      const wishlistProductIds = user.role.details.wishlist || [];
      
      if (wishlistProductIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Wishlist is empty',
          wishlist: [],
          wishlistCount: 0
        });
      }
      
      // Get product details for wishlist items
      const wishlistProducts = await productCollection.find({
        productId: { $in: wishlistProductIds },
        product_status: 'released' // Only include released products
      }).toArray();
      
      res.status(200).json({
        success: true,
        message: 'Wishlist fetched successfully',
        wishlist: wishlistProducts,
        wishlistCount: wishlistProducts.length,
        wishlistProductIds: wishlistProductIds
      });
      
    } catch (error) {
      console.error('Get wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  return router;
};