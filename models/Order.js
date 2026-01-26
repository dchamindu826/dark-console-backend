const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // 🔥 FIX: Changed ObjectId to String to support Firebase UIDs
  userId: { type: String, required: false }, 
  
  customer: {
    name: { type: String, required: true },
    contact: { type: String, required: true },
  },
  packageDetails: {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    platform: { type: String },
    version: { type: String },
    eventId: { type: String }, // To link with Event
    mode: { type: String } 
  },
  paymentSlip: { type: String, required: true },
  
  orderType: { type: String, enum: ['service', 'event'], default: 'service' },
  crewCode: { type: String, default: null },
  crewName: { type: String, default: null },

  status: {
    type: String,
    enum: ['pending', 'pool', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  cancellationReason: { type: String, default: "" },
  chatRoomId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);