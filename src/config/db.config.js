const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_DB_URL) {
        console.error('Error: MONGO_DB_URL is not defined in .env file.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
