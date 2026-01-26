const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk User ID or Firebase UID
  username: { type: String, required: true },
  avatar: { type: String },
  message: { type: String },
  image: { type: String }, // Optional Image
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityMessage', default: null }, // Reply Logic
  isAdmin: { type: Boolean, default: false }, // Highlight Admin Msgs
  reactions: { type: Map, of: Number, default: {} }, // { "❤️": 2, "😂": 5 }
  createdAt: { type: Date, default: Date.now, expires: 36000 } // 🔥 Auto delete after 10 hours (36000 seconds)
});

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);