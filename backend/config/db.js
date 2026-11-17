import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(` MongoDB Connected (Custom URI): ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(` Failed connecting to provided MONGODB_URI (${customUri}): ${err.message}`);
      console.log(' Falling back to embedded MongoMemoryServer for reliable execution...');
    }
  }

  // Attempt standard local connection first
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/moon_light_villa', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(` MongoDB Connected (Local daemon): ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(' Local MongoDB daemon not active. Initializing embedded MongoMemoryServer...');
    try {
      const memoryOptions = {
        instance: {
          dbName: 'moon_light_villa',
        }
      };
      const binaryVersion = process.env.MONGOMS_VERSION || '8.2.6';
      if (binaryVersion) {
        memoryOptions.binary = { version: binaryVersion };
      }
      mongod = await MongoMemoryServer.create(memoryOptions);
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(` MongoDB Connected (Embedded Memory Server): ${uri}`);
      return conn;
    } catch (memoryErr) {
      console.error(' Critical: Failed to launch embedded MongoDB instance:', memoryErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};
