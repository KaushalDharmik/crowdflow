const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  threshold: { type: Number, default: 80 }, // alert triggers at this % full
});

const timeSlotSchema = new mongoose.Schema({
  time: { type: String, required: true },
  maxCapacity: { type: Number, required: true },
  bookedCount: { type: Number, default: 0 },
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  totalCapacity: { type: Number, required: true },
  zones: [zoneSchema],
  timeSlots: [timeSlotSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
