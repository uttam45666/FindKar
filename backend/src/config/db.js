import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    logger.info('db.connection.start');
    const conn = await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    logger.info('db.connection.success', { host: conn.connection.host });
  } catch (error) {
    logger.error('db.connection.error', { message: error.message, stack: error.stack });
    throw error;
  }
};

export default connectDB;
