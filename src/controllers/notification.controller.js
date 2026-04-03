const Notification = require('../models/notification.model');
const asyncHandler = require('../middleware/async.handler');
const ErrorResponse = require('../utils/error.response');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ userId: req.user.id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns notification
    if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this notification`, 401));
    }

    notification = await Notification.findByIdAndUpdate(req.params.id, { unread: false }, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all user notifications as read
// @route   PUT /api/v1/notifications/readall
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
        { userId: req.user.id, unread: true },
        { $set: { unread: false } }
    );

    res.status(200).json({
        success: true,
        data: {}
    });
});
