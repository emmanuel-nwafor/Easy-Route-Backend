const User = require('../models/user.model');
const asyncHandler = require('../middleware/async.handler');
const ErrorResponse = require('../utils/error.response');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a user, generate OTP
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return next(new ErrorResponse('Please provide a name and email', 400));
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorResponse('Email already registered', 400));
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    user = await User.create({
        name,
        email,
        otp,
        otpExpire
    });

    console.log(`[SIMULATED EMAIL] OTP for ${email} (Registration): ${otp}`);

    res.status(201).json({
        success: true,
        message: 'OTP sent to your email.'
    });
});

// @desc    Request login OTP
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorResponse('Please provide an email', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    console.log(`[SIMULATED EMAIL] OTP for ${email} (Login): ${otp}`);

    res.status(200).json({
        success: true,
        message: 'OTP sent to your email.'
    });
});

// @desc    Verify OTP and log in / finalize registration
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorResponse('Please provide an email and OTP', 400));
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire');

    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    if (user.otp !== otp) {
        return next(new ErrorResponse('Invalid OTP', 401));
    }

    if (user.otpExpire < new Date()) {
        return next(new ErrorResponse('OTP has expired', 401));
    }

    // OTP fits, user valid
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
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
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };

    res.status(statusCode).cookie('token', token, options).json(response);
};
