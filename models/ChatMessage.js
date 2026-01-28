const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Order Link
  author: { type: String, required: true }, // Display Name
  senderId: { type: String }, // User/Admin ID
  senderName: { type: String },
  message: { type: String },
  
  // 🔥 මෙන්න මේක අනිවාර්යයෙන්ම තියෙන්න ඕන Images Save වෙන්න:
  image: { type: String }, // Base64 String එක මෙතනට Save වෙනවා
  type: { type: String, default: 'text' }, // 'text' or 'image'
  
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);