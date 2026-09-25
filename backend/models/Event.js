const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide an event category'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Please provide an event date (e.g. YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Please provide an event start time (e.g. 18:00)'],
    },
    location: {
      type: String,
      required: [true, 'Please provide an event location/venue'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify the total event capacity'],
      min: [1, 'Capacity must be at least 1 seat'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
    },
    image: {
      type: String,
      required: [true, 'Please upload an image for the event'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Cancelled', 'Completed'],
        message: 'Status must be either Active, Cancelled, or Completed',
      },
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries sorted by date
eventSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
