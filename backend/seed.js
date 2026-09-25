const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Check if test user already exists
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Demo Organizer',
        email: 'test@example.com',
        password: 'password123',
      });
      console.log('✅ Demo user created: test@example.com / password123');
    } else {
      console.log('ℹ️ Demo user already exists: test@example.com');
    }

    // Check if sample event exists
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.create({
        title: 'SLIIT National Tech Summit 2026',
        description: 'Join industry leaders and tech pioneers for Sri Lanka largest student technology symposium. Keynotes, workshops, and networking sessions.',
        category: 'Technology',
        date: '2026-10-25',
        time: '09:30 AM',
        location: 'SLIIT Main Auditorium, Malabe Campus',
        capacity: 100,
        availableSeats: 100,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        status: 'Active',
        createdBy: user._id,
      });
      console.log('✅ Sample event created!');
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
