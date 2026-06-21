const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitid: { type: String, required: true },
  unit_value: { type: Number, required: true },
  unit_type: { type: String, required: true },
  unit_quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true }
}, { _id: false });

const ratingSchema = new mongoose.Schema({
  email: { type: String, required: true },
  rate: { type: Number, max: 5, min: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  selleremail: { type: String, required: true }, // Ties to User(Seller)
  product_name: { type: String, required: true },
  product_imgurl: { type: String },
  category: { type: String, required: true },
  product_publishdate: { type: String },
  product_status: { 
    type: String, 
    enum: ['released', 'pending', 'rejected'], 
    default: 'pending' 
  },
  quantity_description: [unitSchema],
  rating: [ratingSchema],
  sell_count: [String], // Array of emails for users who bought the product
  created_date: { type: String },
  status: { type: String },
  approved: { type: Boolean },
  statusUpdatedAt: { type: Date },
  statusUpdatedBy: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema, 'products_collection');
