const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/course_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    // Check users collection
    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log('Number of users:', users.length);
    console.log('Users:', users);

    // List indexes on users collection
    const indexes = await mongoose.connection.db.collection('users').indexes();
    console.log('Indexes on users collection:', indexes);

    process.exit(0);
  } catch (error) {
    console.error('Error testing connection:', error);
    process.exit(1);
  }
};

testConnection(); 