const Event = require('../models/Event');
const Alert = require('../models/Alert');

// GET /api/events — public, active events only
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/events/all — admin, all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events — admin creates event
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/events/:id/occupancy — admin updates a zone's occupancy manually
exports.updateOccupancy = async (req, res) => {
  try {
    const { zoneId, occupancy } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const zone = event.zones.id(zoneId);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });

    zone.currentOccupancy = occupancy;
    await event.save();

    // Auto-create alert if zone exceeds threshold
    const pct = Math.round((occupancy / zone.capacity) * 100);
    if (pct >= zone.threshold) {
      const severity = pct >= 95 ? 'critical' : pct >= 85 ? 'high' : 'medium';
      await Alert.create({
        event: event._id,
        zone: zone.name,
        message: `${zone.name} is at ${pct}% capacity (${occupancy}/${zone.capacity})`,
        severity,
      });
      // Emit real-time alert via socket
      const io = req.app.get('io');
      if (io) io.emit('newAlert', { zone: zone.name, pct, severity, eventName: event.name });
    }

    // Broadcast updated event to all connected clients
    const io = req.app.get('io');
    if (io) io.emit('occupancyUpdate', { eventId: event._id, zones: event.zones });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/events/:id/status — admin changes event status
exports.updateStatus = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
