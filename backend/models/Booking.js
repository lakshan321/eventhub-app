const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Booking must be associated with an event'],
    },
    numberOfTickets: {
      type: Number,
      required: [true, 'Please provide the number of tickets'],
      min: [1, 'You must book at least 1 ticket'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Cancelled'],
        message: 'Booking status must be Pending, Confirmed, or Cancelled',
      },
      default: 'Confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick queries of a user's bookings
bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
