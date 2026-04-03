const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db.config');
const errorMiddleware = require('./middleware/error.middleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Travel Planner API is live' });
});

// Load Routers
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/plans', require('./routes/plan.routes'));
app.use('/api/v1/bookings', require('./routes/booking.routes'));

// Error Middleware (Must be last)
app.use(errorMiddleware);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`✈️  Travel Planner Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(` Rejection Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});