const express = require('express');
const {
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan
} = require('../controllers/plan.controller');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

// Include other resource routers
const bookingRouter = require('./booking.routes');

// Re-route into other resource routers
router.use('/:planId/bookings', bookingRouter);

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(getPlans)
    .post(createPlan);

router
    .route('/:id')
    .get(getPlan)
    .put(updatePlan)
    .delete(deletePlan);

module.exports = router;
