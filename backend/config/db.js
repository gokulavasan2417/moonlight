import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  // Reuse existing connection in serverless warm invocations
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      const conn = await mongoose.connect(customUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(` MongoDB Connected (Custom URI): ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(` Failed connecting to provided MONGODB_URI: ${err.message}`);
      if (process.env.VERCEL) {
        throw new Error(`Failed connecting to MONGODB_URI on Vercel: ${err.message}`);
      }
      console.log(' Falling back to embedded MongoMemoryServer for reliable execution...');
    }
  }

  // If deployed on Vercel without MONGODB_URI, halt with actionable message
  if (process.env.VERCEL) {
    throw new Error('MONGODB_URI environment variable is required when deployed on Vercel.');
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
