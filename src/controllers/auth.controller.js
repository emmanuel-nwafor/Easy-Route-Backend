const crypto = require('crypto');
const bip39 = require('bip39');
const User = require('../models/user.model');
const asyncHandler = require('../middleware/async.handler');
const ErrorResponse = require('../utils/error.response'); // Corrected path

// @desc    Register user and generate recovery phrase
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, handle, email, publicKey, deviceId } = req.body;

    // Check if user exists
    let user = await User.findOne({ handle });
    if (user) {
        return next(new ErrorResponse('Handle already taken', 400));
    }

    // Generate 12-word recovery phrase
    const mnemonic = bip39.generateMnemonic();
    
    // Hash the mnemonic for storage
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedRecovery = crypto.pbkdf2Sync(mnemonic, salt, 1000, 64, 'sha512').toString('hex');
    const recoveryStorage = `${salt}:${hashedRecovery}`;

    // Create user
    user = await User.create({
        name,
        handle,
        email,
        publicKey,
        deviceId,
        recoveryCode: recoveryStorage
    });

    sendTokenResponse(user, 201, res, mnemonic);
});

// @desc    Get a challenge for login
// @route   GET /api/v1/auth/challenge/:handle
// @access  Public
exports.getChallenge = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ handle: req.params.handle });

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Generate a random 32-byte challenge
    const challenge = crypto.randomBytes(32).toString('hex');
    
    // Save challenge to user (temporary)
    user.currentChallenge = challenge;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        challenge
    });
});

// @desc    Verify signature and login
// @route   POST /api/v1/auth/verify
// @access  Public
exports.verifySignature = asyncHandler(async (req, res, next) => {
    const { handle, signature } = req.body;

    const user = await User.findOne({ handle }).select('+currentChallenge +publicKey');

    if (!user || !user.currentChallenge) {
        return next(new ErrorResponse('Invalid login attempt or challenge expired', 401));
    }

    // Verify the signature
    // Note: Expecting signature in base64, publicKey in PEM or appropriate format
    try {
        const verifier = crypto.createVerify('SHA256');
        verifier.update(user.currentChallenge);
        verifier.end();

        const isVerified = verifier.verify(user.publicKey, signature, 'base64');

        if (!isVerified) {
            return next(new ErrorResponse('Authentication failed: Invalid signature', 401));
        }
    } catch (err) {
        return next(new ErrorResponse(`Verification Error: ${err.message}`, 400));
    }

    // Clear challenge
    user.currentChallenge = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
});

// @desc    Recover account with secret phrase
// @route   POST /api/v1/auth/recover
// @access  Public
exports.recoverAccount = asyncHandler(async (req, res, next) => {
    const { handle, mnemonic, newPublicKey, newDeviceId } = req.body;

    const user = await User.findOne({ handle }).select('+recoveryCode');

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    // Verify mnemonic
    const [salt, storedHash] = user.recoveryCode.split(':');
    const inputHash = crypto.pbkdf2Sync(mnemonic, salt, 1000, 64, 'sha512').toString('hex');

    if (inputHash !== storedHash) {
        return next(new ErrorResponse('Invalid recovery phrase', 401));
    }

    // Update user with new device info
    user.publicKey = newPublicKey;
    user.deviceId = newDeviceId;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Account recovered successfully. New device linked.'
    });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, mnemonic = null) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    const response = {
        success: true,
        token
    };

    if (mnemonic) {
        response.recoveryPhrase = mnemonic;
    }

    res.status(statusCode).cookie('token', token, options).json(response);
};
