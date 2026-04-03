const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    handle: {
        type: String,
        required: [true, 'Please add a unique handle (e.g. email or username)'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    publicKey: {
        type: String,
        required: [true, 'Display Public Key is required for device-auth']
    },
    deviceId: {
        type: String,
        required: [true, 'Device ID is required']
    },
    recoveryCode: {
        type: String,
        required: [true, 'Recovery code is required'],
        select: false
    },
    currentChallenge: {
        type: String,
        select: false
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

// Sign JWT and return using ID
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, handle: this.handle }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', UserSchema);
