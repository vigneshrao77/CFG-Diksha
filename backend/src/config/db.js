const dns = require('dns');
// Use reliable public DNS resolvers to prevent SRV lookup timeouts on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // fallback if environment does not allow setting DNS
}

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diksha_db';
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`✅ MongoDB connected to database: ${mongoose.connection.name} (${mongoose.connection.host})`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Running in fallback mode (no database connection)');
  }
};

module.exports = connectDB;
