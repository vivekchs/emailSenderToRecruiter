const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fastify_email';

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info(`Connected to MongoDB with Mongoose`);
  } catch (err) {
    logger.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

module.exports = { connectDB };
