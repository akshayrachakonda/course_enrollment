const mongoose = require('mongoose');
const User = require('../models/User');

const resetUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Drop the users collection
    await User.collection.drop();
    console.log('Dropped users collection');

    // Create the collection with the correct schema
    await User.createCollection();
    console.log('Created new users collection');

    // Create the email index
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('Created email index');

    console.log('Users collection reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting users collection:', error);
    process.exit(1);
  }
};

resetUsers(); 