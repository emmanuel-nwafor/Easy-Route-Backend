const asyncHandler = require('../middleware/async.handler');

// @desc    Search for travel routes (Mock)
// @route   GET /api/v1/discovery/search
// @access  Public
exports.searchRoutes = asyncHandler(async (req, res, next) => {
    const { from, to, date, type } = req.query;

    // This is a placeholder for real travel API integration (e.g. Amadeus, Skyscanner)
    const mockRoutes = [
        {
            id: 'mock-1',
            type: type || 'flight',
            time: '10:00',
            from: from || 'LHR',
            to: to || 'DPS',
            operator: 'Qantas Airways',
            price: '$850',
            recommended: true,
            reliability: 'On Time'
        },
        {
            id: 'mock-2',
            type: 'bus',
            time: '14:30',
            from: from || 'LHR',
            to: to || 'CDG',
            operator: 'FlixBus',
            price: '$45',
            warning: 'Possible Delay'
        }
    ];

    res.status(200).json({
        success: true,
        count: mockRoutes.length,
        data: mockRoutes
    });
});
