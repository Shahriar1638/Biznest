const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: {
    type: { type: String, enum: ['admin', 'customer', 'seller'], required: true },
    details: {
      // For Admin
      adminID: String,
      salary: Number,
      
      // For Customer
      customerID: String,
      points: Number,
      wishlist: [String], // Array of Object IDs or strings pointing to Products
      
      // For Seller
      sellerID: String,
      revenue: Number,
      numOfApproved: Number,
      numOfReject: Number
    }
  },
  username: { type: String, required: true },
  password: { type: String, required: true },
  phone_number: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  profileurl: { type: String },
  address: { type: String },
  ban_status: { type: Boolean, default: false }
}, { 
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

// The 3rd argument 'userinfos' forces Mongoose to use your existing collection name
module.exports = mongoose.model('User', userSchema, 'userinfos');
