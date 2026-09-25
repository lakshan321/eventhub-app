const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialize MongoDB connection
connectDB();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check / Base route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventHub Event Management API is running',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Define PORT and bind host for hosting platforms (Render/Railway require 0.0.0.0)
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`[EventHub Server] Running on http://${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
