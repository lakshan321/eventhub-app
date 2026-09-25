const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes (require JWT authentication)
router.post('/', protect, upload.single('image'), createEvent);
router.put('/:id', protect, upload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
