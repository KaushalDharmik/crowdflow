const router = require('express').Router();
const {
  getAlerts,
  getAllAlerts,
  createAlert,
  resolveAlert,
  getEventAlerts,
} = require('../controllers/alertController');

router.get('/', getAlerts);                         // active alerts
router.get('/all', getAllAlerts);                   // all including resolved
router.post('/', createAlert);                      // manual alert
router.patch('/:id/resolve', resolveAlert);         // security resolves alert
router.get('/event/:eventId', getEventAlerts);      // alerts for one event

module.exports = router;
