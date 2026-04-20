const router = require('express').Router();
const {
  getEvents,
  getAllEvents,
  getEvent,
  createEvent,
  updateOccupancy,
  updateStatus,
} = require('../controllers/eventController');

router.get('/', getEvents);           // public
router.get('/all', getAllEvents);      // admin
router.post('/', createEvent);        // admin
router.get('/:id', getEvent);         // public
router.patch('/:id/occupancy', updateOccupancy); // admin
router.patch('/:id/status', updateStatus);       // admin

module.exports = router;
