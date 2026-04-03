const asyncHandler = require('../middleware/async.handler');
const ErrorResponse = require('../utils/error.response');
const Route = require('../models/route.model');

// @desc    Search for travel routes
// @route   GET /api/v1/discovery/search
// @access  Public
exports.searchRoutes = asyncHandler(async (req, res, next) => {
    const { from, to, date, type } = req.query;

    if (!from || !to) {
        return next(new ErrorResponse('Please provide both origin and destination', 400));
    }

    // Dynamic search across generated routes
    const query = {
        from: { $regex: new RegExp(from, 'i') },
        to: { $regex: new RegExp(to, 'i') }
    };

    if (type) {
        query.type = type;
    }

    const routes = await Route.find(query).sort('-createdAt');

    // If no exact match found, we could return nearby or curated options (Advanced implementation)
    // For now, we return the matches from the Route collection

    res.status(200).json({
        success: true,
        count: routes.length,
        data: routes
    });
});

// @desc    Get all travel routes
// @route   GET /api/v1/discovery/all
// @access  Public
exports.getAllRoutes = asyncHandler(async (req, res, next) => {
    const routes = await Route.find().sort('-createdAt');

    res.status(200).json({
        success: true,
        count: routes.length,
        data: routes
    });
});
