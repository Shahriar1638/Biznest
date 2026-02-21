const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  userEmail: { type: String, trim: true, lowercase: true },
  
  userType: { type: String, default: 'general' },
  issueCategory: { type: String, required: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
  
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  
  reply: { type: String },
  assignedTo: { type: String },
  
  msgAdminStatus: { type: Boolean, default: false }, // if admin read it
  msgClientStatus: { type: Boolean, default: false }, // if client read reply
  clientReadAt: { type: Date }
});

module.exports = mongoose.model('Contact', contactSchema, 'contact_messages');
