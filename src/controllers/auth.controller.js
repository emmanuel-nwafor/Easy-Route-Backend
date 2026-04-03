const User = require('../models/user.model');
const asyncHandler = require('../middleware/async.handler');
const ErrorResponse = require('../utils/error.response');

// @route   POST /api/v1/auth/register
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, pin } = req.body;

    if (!name || !email || !pin) {
        return next(new ErrorResponse('Please provide name, email, and a 6-digit PIN', 400));
    }

    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorResponse('Email already registered', 400));
    }

    user = await User.create({
        name,
        email,
        pin
    });

    sendTokenResponse(user, 201, res);
});

// @route   POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res, next) => {
    const { email, pin } = req.body;

    if (!email || !pin) {
        return next(new ErrorResponse('Please provide an email and PIN', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+pin');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if PIN matches
    const isMatch = await user.matchPin(pin);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000),
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
