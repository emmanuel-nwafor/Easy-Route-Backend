const cron = require('node-cron');
const Route = require('../models/route.model');

const AIRPORTS = [
    { name: 'LHR', city: 'London', lat: 51.4700, lng: -0.4543 },
    { name: 'DPS', city: 'Bali', lat: -8.7482, lng: 115.1671 },
    { name: 'JFK', city: 'New York', lat: 40.6413, lng: -73.7781 },
    { name: 'DXB', city: 'Dubai', lat: 25.2532, lng: 55.3657 },
    { name: 'SIN', city: 'Singapore', lat: 1.3644, lng: 103.9915 },
    { name: 'SFO', city: 'San Francisco', lat: 37.6213, lng: -122.3790 },
    { name: 'CDG', city: 'Paris', lat: 49.0097, lng: 2.5479 },
    { name: 'SYD', city: 'Sydney', lat: -33.9399, lng: 151.1753 },
    { name: 'HND', city: 'Tokyo', lat: 35.5494, lng: 139.7798 },
    { name: 'FRA', city: 'Frankfurt', lat: 50.0379, lng: 8.5622 },
    // African Hubs
    { name: 'JNB', city: 'Johannesburg', lat: -26.1367, lng: 28.2411 },
    { name: 'CAI', city: 'Cairo', lat: 30.1219, lng: 31.4056 },
    { name: 'LOS', city: 'Lagos', lat: 6.5774, lng: 3.3210 },
    { name: 'NBO', city: 'Nairobi', lat: -1.3192, lng: 36.9275 },
    { name: 'CPT', city: 'Cape Town', lat: -33.9715, lng: 18.6021 },
    { name: 'ADD', city: 'Addis Ababa', lat: 8.9778, lng: 38.7993 },
    // Americas & Canada
    { name: 'YYZ', city: 'Toronto', lat: 43.6777, lng: -79.6248 },
    { name: 'GRU', city: 'São Paulo', lat: -23.4356, lng: -46.4731 },
    { name: 'MEX', city: 'Mexico City', lat: 19.4361, lng: -99.0719 },
    // Middle East / Asia Pacific
    { name: 'BKK', city: 'Bangkok', lat: 13.6895, lng: 100.7501 },
    { name: 'ICN', city: 'Seoul', lat: 37.4602, lng: 126.4407 }
];

const OPERATORS = [
    { name: 'Qantas Airways', logo: 'https://logo.clearbit.com/qantas.com', type: 'flight' },
    { name: 'Emirates', logo: 'https://logo.clearbit.com/emirates.com', type: 'flight' },
    { name: 'Eurostar', logo: 'https://logo.clearbit.com/eurostar.com', type: 'train' },
    { name: 'Lufthansa', logo: 'https://logo.clearbit.com/lufthansa.com', type: 'flight' },
    { name: 'Amtrak', logo: 'https://logo.clearbit.com/amtrak.com', type: 'train' },
    { name: 'Qatar Airways', logo: 'https://logo.clearbit.com/qatarairways.com', type: 'flight' },
    { name: 'British Airways', logo: 'https://logo.clearbit.com/britishairways.com', type: 'flight' },
    // New Operators
    { name: 'Ethiopian Airlines', logo: 'https://logo.clearbit.com/ethiopianairlines.com', type: 'flight' },
    { name: 'South African Airways', logo: 'https://logo.clearbit.com/flysaa.com', type: 'flight' },
    { name: 'Kenya Airways', logo: 'https://logo.clearbit.com/kenya-airways.com', type: 'flight' },
    { name: 'Air France', logo: 'https://logo.clearbit.com/airfrance.com', type: 'flight' },
    { name: 'Singapore Airlines', logo: 'https://logo.clearbit.com/singaporeair.com', type: 'flight' },
    { name: 'Air Canada', logo: 'https://logo.clearbit.com/aircanada.com', type: 'flight' },
    { name: 'JR Central', logo: 'https://logo.clearbit.com/jr-central.co.jp', type: 'train' },
    { name: 'SNCF', logo: 'https://logo.clearbit.com/sncf.com', type: 'train' },
    { name: 'Royal Air Maroc', logo: 'https://logo.clearbit.com/royalairmaroc.com', type: 'flight' },
    { name: 'EgyptAir', logo: 'https://logo.clearbit.com/egyptair.com', type: 'flight' }
];

const TRANSPORT_VISUALS = {
    flight: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
        'https://images.unsplash.com/photo-1540339832862-47455913cca7',
        'https://images.unsplash.com/photo-1556388158-158ea5ccacbd'
    ],
    train: [
        'https://images.unsplash.com/photo-1474487548417-781f274296f3',
        'https://images.unsplash.com/photo-1515162305285-0293e4767cc2',
        'https://images.unsplash.com/photo-1532105956626-9569c0cc72ff'
    ],
    bus: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e'
    ]
};

const generateRandomRoute = () => {
    const origin = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
    let destination = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];

    // Ensure origin and destination are different
    while (destination.name === origin.name) {
        destination = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
    }

    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    
    // Pick transport-specific thumbnail library
    const visuals = TRANSPORT_VISUALS[operator.type] || TRANSPORT_VISUALS.flight;
    const thumbnail = visuals[Math.floor(Math.random() * visuals.length)];
    
    // Pricing logic
    const price = Math.floor(Math.random() * 1600) + 200;

    // Random duration between 2 and 18 hours
    const hours = Math.floor(Math.random() * 16) + 2;
    const minutes = Math.floor(Math.random() * 59);

    // Random times
    const startHour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const startMin = Math.floor(Math.random() * 59).toString().padStart(2, '0');

    // Simulating intermediate points for path
    const pathSegments = 3;
    const path = [];
    for (let i = 0; i <= pathSegments; i++) {
        const ratio = i / pathSegments;
        path.push({
            latitude: origin.lat + (destination.lat - origin.lat) * ratio + (Math.random() - 0.5) * 5,
            longitude: origin.lng + (destination.lng - origin.lng) * ratio + (Math.random() - 0.5) * 5
        });
    }

    return {
        type: operator.type,
        from: origin.name,
        to: destination.name,
        operator: operator.name,
        carrierLogo: operator.logo,
        thumbnail,
        price,
        duration: `${hours}h ${minutes}m`,
        departureTime: `${startHour}:${startMin}`,
        arrivalTime: `${(parseInt(startHour) + hours) % 24}:${startMin}`,
        coordinates: {
            origin: { latitude: origin.lat, longitude: origin.lng },
            destination: { latitude: destination.lat, longitude: destination.lng }
        },
        path
    };
};

const initCronJobs = () => {
    const cronInterval = process.env.CRON_INTERVAL || '*/30 * * * *';
    const cronResetTime = process.env.CRON_RESET_TIME || '0 0 * * *';

    // Generate 20 random routes based on configured interval
    cron.schedule(cronInterval, async () => {
        console.log(`--- CRON: Refreshing Travel Routes (${cronInterval}) ---`);
        try {
            const routes = [];
            for (let i = 0; i < 20; i++) {
                routes.push(generateRandomRoute());
            }
            await Route.insertMany(routes);
            console.log(`Successfully added ${routes.length} fresh routes.`);
        } catch (err) {
            console.error('CRON ERROR: Route generation failed:', err);
        }
    });

    // Clear expired routes based on configured reset time
    cron.schedule(cronResetTime, async () => {
        console.log(`--- CRON: Daily Reset of Discovery Database (${cronResetTime}) ---`);
        try {
            await Route.deleteMany({});
            console.log('Discovery database cleared for standard reset.');
        } catch (err) {
            console.error('CRON ERROR: Database reset failed:', err);
        }
    });

    console.log(`Automation initialized: Route Generator (${cronInterval}) and Reset (${cronResetTime}).`);
};


module.exports = initCronJobs;
