const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  rank: { type: Number, required: true, unique: true }, // 1, 2, 3, 4, 5
  name: { type: String, required: true }, // Player or Crew Name
  points: { type: String, required: true }, // e.g., "2500"
  avatar: { type: String, required: true } // Base64 Image
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);