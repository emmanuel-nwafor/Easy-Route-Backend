const express = require('express');
const {
    getBookings,
    getBooking,
    addBooking,
    placeBooking,
    updateBooking,
    deleteBooking
} = require('../controllers/booking.controller');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth.middleware');

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(getBookings)
    .post(placeBooking);

router
    .route('/:id')
    .get(getBooking)
    .put(updateBooking)
    .delete(deleteBooking);

module.exports = router;
