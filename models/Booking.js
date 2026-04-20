const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userName: { type: String, required: true, trim: true },
  userEmail: { type: String, required: true, trim: true, lowercase: true },
  timeSlot: { type: String, required: true },
  zone: { type: String, required: true },
  qrCode: { type: String }, // base64 data URL from qrcode package
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
