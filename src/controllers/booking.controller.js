const asyncHandler = require('../middleware/async.handler');
const Booking = require('../models/booking.model');
const Plan = require('../models/plan.model');

/**
 * @desc    Get all bookings for a specific plan
 * @route   GET /api/v1/plans/:planId/bookings
 * @access  Private
 */
exports.getBookings = asyncHandler(async (req, res, next) => {
    let query;

    if (req.params.planId) {
        query = Booking.find({ plan: req.params.planId, user: req.user.id });
    } else {
        query = Booking.find({ user: req.user.id }).populate({
            path: 'plan',
            select: 'title destination'
        });
    }

    const bookings = await query;

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

/**
 * @desc    Get single booking
 * @route   GET /api/v1/bookings/:id
 * @access  Private
 */
exports.getBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate({
        path: 'plan',
        select: 'title destination'
    });

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure user owns the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to access this booking' });
    }

    res.status(200).json({
        success: true,
        data: booking
    });
});

/**
 * @desc    Add booking to a plan
 * @route   POST /api/v1/plans/:planId/bookings
 * @access  Private
 */
exports.addBooking = asyncHandler(async (req, res, next) => {
    req.body.plan = req.params.planId;
    req.body.user = req.user.id;

    const plan = await Plan.findById(req.params.planId);

    if (!plan) {
        return res.status(404).json({ success: false, message: 'No plan found with that ID' });
    }

    // Make sure user owns the plan
    if (plan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to add bookings to this plan' });
    }

    const booking = await Booking.create(req.body);

    res.status(201).json({
        success: true,
        data: booking
    });
});

/**
 * @desc    Update booking
 * @route   PUT /api/v1/bookings/:id
 * @access  Private
 */
exports.updateBooking = asyncHandler(async (req, res, next) => {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure user owns the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: booking
    });
});

/**
 * @desc    Delete booking
 * @route   DELETE /api/v1/bookings/:id
 * @access  Private
 */
exports.deleteBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure user owns the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    await booking.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
