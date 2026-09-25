const Event = require('../models/Event');
const { getImageUrl } = require('../middleware/uploadMiddleware');
const fs = require('fs');
const path = require('path');

/**
 * Format event object with full image URL for client display
 */
const formatEvent = (req, event) => {
  const eventObj = event.toObject ? event.toObject() : { ...event };
  if (eventObj.image && !eventObj.image.startsWith('http')) {
    eventObj.imageUrl = getImageUrl(req, eventObj.image);
  } else {
    eventObj.imageUrl = eventObj.image;
  }
  return eventObj;
};

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const formattedEvents = events.map((event) => formatEvent(req, event));

    return res.status(200).json({
      success: true,
      count: formattedEvents.length,
      data: formattedEvents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatEvent(req, event),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Registered users)
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, location, capacity } = req.body;

    // Validate required fields
    if (!title || !description || !category || !date || !time || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, date, time, location, and capacity',
      });
    }

    // Validate image file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image for the event',
      });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive number greater than 0',
      });
    }

    // Initial available seats equal the total capacity
    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      location,
      capacity: parsedCapacity,
      availableSeats: parsedCapacity,
      image: req.file.filename,
      createdBy: req.user._id,
      status: 'Active',
    });

    const populatedEvent = await event.populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: formatEvent(req, populatedEvent),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing event
 * @route   PUT /api/events/:id
 * @access  Private (Event creator only)
 */
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization check: Only the event creator can edit
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event. Only the creator can modify it.',
      });
    }

    const { title, description, category, date, time, location, capacity, status } = req.body;

    // Handle capacity change safely
    if (capacity !== undefined) {
      const parsedCapacity = parseInt(capacity, 10);
      if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be a positive number greater than 0',
        });
      }

      // Calculate seats already booked
      const bookedSeats = event.capacity - event.availableSeats;
      if (parsedCapacity < bookedSeats) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity to ${parsedCapacity}. ${bookedSeats} seats are already booked.`,
        });
      }

      event.capacity = parsedCapacity;
      event.availableSeats = parsedCapacity - bookedSeats;
    }

    // Update optional fields if provided
    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (status) event.status = status;

    // If new image was uploaded, update and optionally remove old file
    if (req.file) {
      const oldFilename = event.image;
      event.image = req.file.filename;

      // Safely delete old local file if it exists
      if (oldFilename) {
        const oldFilePath = path.join(__dirname, '..', 'uploads', oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlink(oldFilePath, () => {});
        }
      }
    }

    await event.save();
    const updatedEvent = await event.populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: formatEvent(req, updatedEvent),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Event creator only)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Authorization check: Only the creator can delete
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event. Only the creator can delete it.',
      });
    }

    // Remove local image file if present
    if (event.image) {
      const filePath = path.join(__dirname, '..', 'uploads', event.image);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    await Event.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
