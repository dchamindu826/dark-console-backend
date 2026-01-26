const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  rating: { type: Number, default: 5 }, // 1-5 Stars
  avatar: { type: String, default: '' } // Base64 Image
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);