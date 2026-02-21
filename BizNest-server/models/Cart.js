const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  unitid: { type: String, required: true },
  selleremail: { type: String, required: true }, // Who listed this product unit
  productId: { type: String, required: true },
  unitquantity: { type: Number, required: true, min: 1 },
  added_date: { type: String }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  customeremail: { type: String, required: true, unique: true }, // The user owning the cart
  cart_details: [cartItemSchema]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Cart', cartSchema, 'cart_collection');
