const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super-admin'], default: 'user' },
  
  // New Field for Telegram
  telegramChatId: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  isProfileLocked: { type: Boolean, default: false }
}, { timestamps: true });

// Password Hash කිරීම (Save කරන්න කලින්)
userSchema.pre('save', async function () { // 'next' අයින් කළා
  if (!this.isModified('password')) return; // return next() වෙනුවට return විතරයි
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password Check කිරීම
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);