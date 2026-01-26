const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'stream_link'
  value: { type: String, default: '' } // YouTube URL or ID
});

module.exports = mongoose.model('Setting', settingSchema);