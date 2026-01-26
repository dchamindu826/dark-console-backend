const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  
  type: { type: String, enum: ['free', 'paid'], required: true },
  mode: { type: String, enum: ['individual', 'crew'], default: 'individual' },
  
  price: { type: Number, default: 0 },
  
  // Participants Limits
  maxParticipants: { type: Number, default: 0 }, // For Individual
  maxCrews: { type: Number, default: 0 }, // For Crew
  maxCrewMembers: { type: Number, default: 4 }, // Members per crew
  
  // Prizes
  prizes: {
      first: { type: String, default: '' },
      second: { type: String, default: '' },
      third: { type: String, default: '' }
  },

  // Registered Data
  participants: [{ userId: String, name: String }], // Individual Users
  crews: [{
      name: String,
      leaderId: String,
      leaderName: String,
      crewCode: String,
      members: [{ userId: String, name: String }]
  }]

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);