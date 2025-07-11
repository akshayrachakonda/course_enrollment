const mongoose = require('mongoose');
const User = require('../models/User');

const fixIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Drop all indexes on the users collection
    await User.collection.dropIndexes();
    console.log('Dropped all indexes on users collection');

    // Recreate the email index
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log('Created email index');

    console.log('Indexes fixed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes(); 