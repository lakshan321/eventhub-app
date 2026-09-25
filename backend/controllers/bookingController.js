const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { getImageUrl } = require('../middleware/uploadMiddleware');

/**
 * Format populated event image URL inside a booking document
 */
const formatBookingEvent = (req, booking) => {
  const b = booking.toObject ? booking.toObject() : { ...booking };
  if (b.eventId && b.eventId.image && !b.eventId.image.startsWith('http')) {
    b.eventId.imageUrl = getImageUrl(req, b.eventId.image);
  } else if (b.eventId) {
    b.eventId.imageUrl = b.eventId.image;
  }
  return b;
};

/**
 * @desc    Create a new booking (with Seat Availability validation)
 * @route   POST /api/bookings
 * @access  Private (Logged in users)
 */
const createBooking = async (req, res, next) => {
  try {
    const { eventId, numberOfTickets } = req.body;

    // Validate request inputs
    if (!eventId || !numberOfTickets) {
      return res.status(400).json({
        success: false,
        message: 'Please provide eventId and numberOfTickets',
      });
    }

    const tickets = parseInt(numberOfTickets, 10);
    if (isNaN(tickets) || tickets <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Number of tickets must be at least 1',
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if event is active
    if (event.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Bookings are closed because this event is ${event.status.toLowerCase()}`,
      });
    }

    // BUSINESS LOGIC: Check seat availability
    if (event.availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This event is completely sold out. No seats are available.',
      });
    }

    if (tickets > event.availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seat(s) are available. You requested ${tickets}.`,
      });
    }

    // Reduce availableSeats safely (prevent negative seats)
    event.availableSeats = Math.max(0, event.availableSeats - tickets);
    await event.save();

    // Create the booking record
    const booking = await Booking.create({
      userId: req.user._id,
      eventId: event._id,
      numberOfTickets: tickets,
      bookingDate: new Date(),
      status: 'Confirmed',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('eventId', 'title date time location category image availableSeats capacity status')
      .populate('userId', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: formatBookingEvent(req, populatedBooking),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings for the logged-in user
 * @route   GET /api/bookings
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('eventId', 'title date time location category image availableSeats capacity status')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => formatBookingEvent(req, b));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('eventId', 'title description date time location category image availableSeats capacity status')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization check: User can only view their own booking
    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatBookingEvent(req, booking),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking (and restore event seats)
 * @route   PUT /api/bookings/:id
 * @access  Private (Booking owner)
 */
const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization check
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    const { status } = req.body;
    const targetStatus = status || 'Cancelled';

    // If already cancelled, do not restore seats twice
    if (booking.status === 'Cancelled' && targetStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
    }

    // BUSINESS LOGIC: When confirmed booking is cancelled, restore seats
    if (booking.status === 'Confirmed' && targetStatus === 'Cancelled') {
      const event = await Event.findById(booking.eventId);
      if (event) {
        // Increase available seats without exceeding total capacity
        event.availableSeats = Math.min(event.capacity, event.availableSeats + booking.numberOfTickets);
        await event.save();
      }
    }

    booking.status = targetStatus;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('eventId', 'title date time location category image availableSeats capacity status')
      .populate('userId', 'name email');

    return res.status(200).json({
      success: true,
      message: `Booking has been ${targetStatus.toLowerCase()} successfully`,
      data: formatBookingEvent(req, populated),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a booking record
 * @route   DELETE /api/bookings/:id
 * @access  Private (Booking owner)
 */
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization check
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking',
      });
    }

    // If deleting an active/confirmed booking, restore the seats to the event
    if (booking.status === 'Confirmed') {
      const event = await Event.findById(booking.eventId);
      if (event) {
        event.availableSeats = Math.min(event.capacity, event.availableSeats + booking.numberOfTickets);
        await event.save();
      }
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
