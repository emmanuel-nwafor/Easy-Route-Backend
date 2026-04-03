const asyncHandler = require('../middleware/async.handler');
const Booking = require('../models/booking.model');
const Plan = require('../models/plan.model');
const Notification = require('../models/notification.model');
const ErrorResponse = require('../utils/error.response');

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

    await Notification.create({
        userId: req.user.id,
        title: 'Booking Confirmed!',
        message: `Your journey plan to ${plan.destination || 'your destination'} has been finalized!`,
        type: 'booking',
        unread: true
    });

    res.status(201).json({
        success: true,
        data: booking
    });
});

/**
 * @desc    Place a booking directly (no plan ID needed — auto-creates a plan)
 * @route   POST /api/v1/bookings
 * @access  Private
 */
exports.placeBooking = asyncHandler(async (req, res, next) => {
    const { type, operator, from, to, departureTime, duration, price, travelClass, seatNumber } = req.body;

    if (!type || !from || !to) {
        return next(new ErrorResponse('Please provide type, from, and to fields', 400));
    }

    // 1. Find or create a default plan for this user
    let plan = await Plan.findOne({ user: req.user.id, status: { $in: ['upcoming', 'draft'] } }).sort('-createdAt');

    if (!plan) {
        plan = await Plan.create({
            user: req.user.id,
            title: `Trip to ${to}`,
            destination: to,
            startDate: departureTime || new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            budget: parseFloat(price) || 0,
            activities: [],
            status: 'upcoming'
        });
    }

    // 2. Generate a short confirmation number
    const confirmationNumber = 'VY-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Create the booking
    const booking = await Booking.create({
        user: req.user.id,
        plan: plan._id,
        type,
        title: `${operator || type} – ${from} to ${to}`,
        confirmationNumber,
        operator: operator || null,
        departureLocation: { name: from },
        arrivalLocation: { name: to },
        departureTime: departureTime ? new Date(departureTime) : new Date(),
        cost: parseFloat(price) || 0,
        travelClass: travelClass || 'Economy',
        seatNumber: seatNumber || null,
        vehicleType: type,
        status: 'confirmed'
    });

    // 4. Fire notification
    await Notification.create({
        userId: req.user.id,
        title: 'Booking Confirmed! 🎉',
        message: `Your ${type} from ${from} to ${to} with ${operator || 'carrier'} has been confirmed. Ref: ${confirmationNumber}`,
        type: 'booking',
        unread: true
    });

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
