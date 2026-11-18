import mongoose from 'mongoose';
import dns from 'dns';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

// Fix for Windows / local Node.js DNS SRV resolution issues with MongoDB Atlas (querySrv ECONNREFUSED)
if (process.platform === 'win32' || !process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (dnsErr) {
    // Ignore in environments where setServers is restricted
  }
}

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
      console.warn(` First connection attempt to provided MONGODB_URI failed: ${err.message}`);
      // Retry with explicit DNS servers in case of Windows querySrv failure
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(customUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(` MongoDB Connected (Custom URI after DNS switch): ${conn.connection.host}`);
        return conn;
      } catch (retryErr) {
        console.warn(` Retry failed connecting to MONGODB_URI: ${retryErr.message}`);
        if (process.env.VERCEL) {
          throw new Error(`Failed connecting to MONGODB_URI on Vercel: ${retryErr.message}`);
        }
        console.log(' Falling back to embedded MongoMemoryServer for reliable execution...');
      }
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
