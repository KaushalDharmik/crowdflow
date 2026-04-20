const Alert = require('../models/Alert');

// GET /api/alerts — all unresolved alerts
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ resolved: false })
      .populate('event', 'name')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/alerts/all — all alerts including resolved
exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('event', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/alerts — manual alert creation
exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    // Emit to all connected clients
    const io = req.app.get('io');
    if (io) io.emit('newAlert', alert);
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/alerts/:id/resolve
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/alerts/event/:eventId
exports.getEventAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ event: req.params.eventId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
