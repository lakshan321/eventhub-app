const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
