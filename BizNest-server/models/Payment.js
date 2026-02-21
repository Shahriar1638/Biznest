const mongoose = require('mongoose');

const cartItemSnapshotSchema = new mongoose.Schema({
  productid: { type: String },
  unitId: { type: String },
  quantity: { type: Number },
  price: { type: Number }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  customer_email: { type: String, required: true },
  paymentMethodId: { type: String },
  payment_amount: { type: Number, required: true }, // Used for Stripe calculation
  calculated_total: { type: Number }, // Raw cart products total
  final_amount: { type: Number }, // E.g., calculated_total + shipping
  
  cartitems: [cartItemSnapshotSchema],
  
  orderID: { type: String },
  itemcount: { type: Number },
  
  payment_date: { type: String }, // e.g., '14-06-2024'
  payment_timestamp: { type: Date }, // Actual Date object for db sorting
  payment_status: { type: String, default: 'pending' }, // 'succeeded', 'requires_action', etc.
  
  transaction_id: { type: String },
  stripe_payment_intent_id: { type: String },
  stripe_payment_method_id: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema, 'payments_details');
