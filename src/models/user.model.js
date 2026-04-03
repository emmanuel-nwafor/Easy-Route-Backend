const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    pin: {
        type: String,
        required: [true, 'Please add a 6-digit PIN'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: 'no-photo.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt PIN using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('pin')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
});

// Sign JWT and return using ID
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET || 'secret_fallback_for_dev_only', 
        {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        }
    );
};

// Match user PIN to hashed PIN in database
UserSchema.methods.matchPin = async function (enteredPin) {
    return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', UserSchema);
