const User = require('../models/user.model');
const asyncHandler = require('../middleware/async.handler');
const ErrorResponse = require('../utils/error.response');
const cloudinary = require('../utils/cloudinary');

// @desc    Get current logged in user
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user details
// @route   PUT /api/v1/users/updatedetails
// @access  Private
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        avatar: req.body.avatar
    };


    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Upload avatar
// @route   POST /api/v1/users/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    try {
        // Convert buffer to data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'avatars',
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
        });

        // Update user record
        const user = await User.findByIdAndUpdate(req.user.id, { avatar: uploadResponse.secure_url }, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        return next(new ErrorResponse('Failed to upload image', 500));
    }
});
