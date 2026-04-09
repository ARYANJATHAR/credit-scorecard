const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let mongoAvailable = false;

mongoose.connection.on('connected', () => {
  mongoAvailable = true;
});

mongoose.connection.on('disconnected', () => {
  mongoAvailable = false;
  console.warn('MongoDB disconnected. Audit logging is running in degraded mode.');
});

mongoose.connection.on('error', (err) => {
  mongoAvailable = false;
  console.error('MongoDB connection error:', err.message);
});

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    mongoAvailable = false;
    console.warn('MongoDB unavailable. Continuing without audit logging.');
    console.warn(err.message);
    return false;
  }
}

function isMongoAvailable() {
  return mongoAvailable && mongoose.connection.readyState === 1;
}

module.exports = { connectMongo, isMongoAvailable };
