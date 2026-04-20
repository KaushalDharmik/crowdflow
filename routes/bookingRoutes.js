const router = require('express').Router();
const { createBooking, getBooking, getEventBookings } = require('../controllers/bookingController');

router.post('/', createBooking);                        // user books
router.get('/:bookingId', getBooking);                  // lookup by bookingId string
router.get('/event/:eventId', getEventBookings);        // admin view all bookings for event

module.exports = router;
