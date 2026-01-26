const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Mod Accounts', 'Boost', 'Packages'], 
    required: true 
  },
  image: { type: String, required: true }, // Base64 String
}, { timestamps: true });

// මේ ලයින් එක වැදගත්. Model එක කලින් හැදිලා නම් ඒකම පාවිච්චි කරන්න කියන එක.
module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);