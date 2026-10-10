const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/health_life_tracker';

    try {
      // Attempt connecting with standard URI (5 second timeout)
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (standardErr) {
      console.log(`⚠️ Could not connect to MongoDB at ${mongoUri}. Falling back to in-memory MongoDB for local execution...`);
    }

    // Fallback to MongoMemoryServer
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ Connected to In-Memory MongoDB at: ${inMemoryUri}`);
      console.log(`💡 Tip: To use a persistent database, provide MONGO_URI in backend/.env`);
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
