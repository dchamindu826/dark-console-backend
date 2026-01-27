const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  senderId: { type: String, required: true }, // User ID or Admin ID
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }, // To differentiate bubbles
  readBy: [{ type: String }], // Optional: for read receipts
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);