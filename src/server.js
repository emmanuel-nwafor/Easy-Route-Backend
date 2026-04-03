if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db.config');
const errorMiddleware = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const planRoutes = require('./routes/plan.routes');
const bookingRoutes = require('./routes/booking.routes');

connectDB();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, process.env.EMAIL_SERVER_URL]
        : '*',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Travel Planner API is live',
        mode: process.env.NODE_ENV || 'development'
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    server.close(async () => {
        await mongoose.connection.close();
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
    });
});