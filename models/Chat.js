const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  author: { type: String }, 
  senderId: { type: String },
  senderName: { type: String },
  message: { type: String },
  image: { type: String }, // For Base64 Images
  type: { type: String, default: 'text' },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true }); // createdAt ඉබේම හැදෙනවා

module.exports = mongoose.model('ChatMessage', chatMessageSchema);