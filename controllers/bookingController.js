const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { eventId, userName, userEmail, timeSlot, zone } = req.body;
    if (!eventId || !userName || !userEmail || !timeSlot || !zone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.status !== 'active') return res.status(400).json({ error: 'Event is not active' });

    const slot = event.timeSlots.find(s => s.time === timeSlot);
    if (!slot) return res.status(400).json({ error: 'Invalid time slot' });
    if (slot.bookedCount >= slot.maxCapacity) {
      return res.status(400).json({ error: 'This time slot is fully booked' });
    }

    // Check zone exists
    const zoneObj = event.zones.find(z => z.name === zone);
    if (!zoneObj) return res.status(400).json({ error: 'Invalid zone' });

    const bookingId = uuidv4().slice(0, 8).toUpperCase();

    // QR code encodes booking summary as JSON string
    const qrPayload = JSON.stringify({
      bookingId,
      event: event.name,
      date: event.date,
      venue: event.venue,
      userName,
      timeSlot,
      zone,
    });
    const qrCode = await QRCode.toDataURL(qrPayload);

    const booking = await Booking.create({
      bookingId,
      event: eventId,
      userName,
      userEmail,
      timeSlot,
      zone,
      qrCode,
    });

    // Increment slot booked count
    slot.bookedCount += 1;
    await event.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/bookings/:bookingId
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('event', 'name date venue');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/bookings/event/:eventId — admin view
exports.getEventBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ event: req.params.eventId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
