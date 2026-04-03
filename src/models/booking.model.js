const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: mongoose.Schema.ObjectId,
        ref: 'Plan',
        required: true
    },
    type: {
        type: String,
        enum: ['flight', 'hotel', 'train', 'bus', 'car-rental', 'activity'],
        required: [true, 'Please add a booking type']
    },
    title: {
        type: String,
        required: [true, 'Please add a booking title'],
        trim: true
    },
    confirmationNumber: {
        type: String,
        required: [true, 'Please add a confirmation number']
    },
    details: {
        type: String
    },
    cost: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled'],
        default: 'confirmed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
