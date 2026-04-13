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
    departureLocation: {
        name: String,
        code: String
    },
    arrivalLocation: {
        name: String,
        code: String
    },
    departureTime: {
        type: Date
    },
    arrivalTime: {
        type: Date
    },
    operator: {
        type: String
    },
    seatNumber: {
        type: String
    },
    travelClass: {
        type: String,
        enum: ['Economy', 'Business', 'First Class'],
        default: 'Economy'
    },
    vehicleType: {
        type: String,
        enum: ['flight', 'train', 'bus', 'car-rental', 'activity']
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
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for 'time' fallback to support frontend displays
BookingSchema.virtual('time').get(function() {
    if (!this.departureTime) return '09:00 AM';
    
    // If it's already a string, return it
    if (typeof this.departureTime === 'string') return this.departureTime;
    
    // If it's a Date object, format it properly
    const date = new Date(this.departureTime);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
});

module.exports = mongoose.model('Booking', BookingSchema);
