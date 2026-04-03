const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a plan title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    destination: {
        type: String,
        required: [true, 'Please add a destination']
    },
    startDate: {
        type: Date,
        required: [true, 'Please add a start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please add an end date']
    },
    budget: {
        type: Number,
        default: 0
    },
    activities: [
        {
            name: { type: String, required: true },
            time: { type: String },
            location: { type: String },
            cost: { type: Number, default: 0 }
        }
    ],
    status: {
        type: String,
        enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Plan', PlanSchema);
