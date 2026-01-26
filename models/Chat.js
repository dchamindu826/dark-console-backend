const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true }, // Optimized for search
  author: { type: String, required: true },
  message: { type: String },
  type: { type: String, default: 'text' }, // 'text' or 'image'
  attachment: { type: String, default: null }, // Base64 string for Image
  replyTo: { // For Replies
      id: String,
      author: String,
      message: String
  },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto delete after 24 Hours
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);