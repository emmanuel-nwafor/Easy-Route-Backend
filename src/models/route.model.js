const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['flight', 'train', 'bus'],
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    operator: {
        type: String,
        required: true
    },
    carrierLogo: {
        type: String
    },
    thumbnail: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    duration: {
        type: String,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    },
    reliability: {
        type: String,
        default: 'High reliability'
    },
    coordinates: {
        origin: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        },
        destination: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        }
    },
    path: [{
        latitude: { type: Number },
        longitude: { type: Number }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for 'time' fallback to support frontend displays
RouteSchema.virtual('time').get(function() {
    return this.departureTime || '09:00 AM';
});

// Index for search
RouteSchema.index({ from: 'text', to: 'text' });

module.exports = mongoose.model('Route', RouteSchema);
