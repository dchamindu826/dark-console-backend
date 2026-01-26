const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  username: { type: String, required: true },
  avatar: { type: String },
  message: { type: String },
  image: { type: String }, 
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityMessage', default: null }, 
  isAdmin: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now, expires: 36000 } // 10 Hours Expiry
});

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);