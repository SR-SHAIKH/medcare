const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('[DB] Connecting to MongoDB...');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,   // Timeout after 10s instead of 30s default
        socketTimeoutMS: 45000,            // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
};

module.exports = connectDB;
