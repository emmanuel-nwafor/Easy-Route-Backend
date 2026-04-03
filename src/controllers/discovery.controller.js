const asyncHandler = require('../middleware/async.handler');
const ErrorResponse = require('../utils/error.response');

// @desc    Search for travel routes (Advanced Mock)
// @route   GET /api/v1/discovery/search
// @access  Public
exports.searchRoutes = asyncHandler(async (req, res, next) => {
    const { from, to, date, type } = req.query;

    if (!from || !to) {
        return next(new ErrorResponse('Please provide both origin and destination', 400));
    }

    // High-fidelity mock data for the LHR (London) to DPS (Bali) route
    const mockRoutes = [
        {
            id: 'route-lhr-dps-1',
            type: 'flight',
            time: '10:00 ➔ 06:25⁺¹', // Local times
            duration: '12h 25m',
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            operator: 'Qantas Airways',
            carrierLogo: 'https://logo.clearbit.com/qantas.com',
            price: '$850',
            recommended: true,
            reliability: 'High reliability',
            coordinates: {
                origin: { latitude: 51.4700, longitude: -0.4543 }, // LHR
                destination: { latitude: -8.7482, longitude: 115.1671 } // DPS
            },
            path: [
                { latitude: 51.4700, longitude: -0.4543 },
                { latitude: 25.2048, longitude: 55.2708 }, // DXB Stop
                { latitude: -8.7482, longitude: 115.1671 }
            ]
        },
        {
            id: 'route-lhr-dps-2',
            type: 'flight',
            time: '06:30 ➔ 19:40⁺¹',
            duration: '30h 10m',
            from: from.toUpperCase(),
            to: to.toUpperCase(),
            operator: 'Emirates',
            carrierLogo: 'https://logo.clearbit.com/emirates.com',
            price: '$580',
            warning: 'Short layover',
            coordinates: {
                origin: { latitude: 51.4700, longitude: -0.4543 },
                destination: { latitude: -8.7482, longitude: 115.1671 }
            },
            path: [
                { latitude: 51.4700, longitude: -0.4543 },
                { latitude: 25.2532, longitude: 55.3657 },
                { latitude: -8.7482, longitude: 115.1671 }
            ]
        }
    ];

    res.status(200).json({
        success: true,
        count: mockRoutes.length,
        data: mockRoutes
    });
});
