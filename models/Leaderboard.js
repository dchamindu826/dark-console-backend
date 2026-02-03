const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  rank: { type: Number, required: true, unique: true }, 
  name: { type: String, required: true }, 
  points: { type: String, required: true }, 
  
  // 🔥 මෙතන කලින් තිබුනේ 'avatar' කියලා. අපි ඒක 'image' කළා Controller එකට ගැලපෙන්න.
  image: { type: String, required: true }, 

  // 🔥 Controller එකෙන් 'game' එකකුත් එවනවා, ඒකත් මෙතනට දාගමු.
  game: { type: String, required: false } 

}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);