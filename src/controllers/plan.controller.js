const asyncHandler = require('../middleware/async.handler');
const Plan = require('../models/plan.model');

/**
 * @desc    Get all plans for the logged-in user
 * @route   GET /api/v1/plans
 * @access  Private
 */
exports.getPlans = asyncHandler(async (req, res, next) => {
    const plans = await Plan.find({ user: req.user.id });

    res.status(200).json({
        success: true,
        count: plans.length,
        data: plans
    });
});

/**
 * @desc    Get single plan
 * @route   GET /api/v1/plans/:id
 * @access  Private
 */
exports.getPlan = asyncHandler(async (req, res, next) => {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Make sure user owns the plan
    if (plan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to access this plan' });
    }

    res.status(200).json({
        success: true,
        data: plan
    });
});

/**
 * @desc    Create new plan
 * @route   POST /api/v1/plans
 * @access  Private
 */
exports.createPlan = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    const plan = await Plan.create(req.body);

    res.status(201).json({
        success: true,
        data: plan
    });
});

/**
 * @desc    Update plan
 * @route   PUT /api/v1/plans/:id
 * @access  Private
 */
exports.updatePlan = asyncHandler(async (req, res, next) => {
    let plan = await Plan.findById(req.params.id);

    if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Make sure user owns the plan
    if (plan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to update this plan' });
    }

    plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: plan
    });
});

/**
 * @desc    Delete plan
 * @route   DELETE /api/v1/plans/:id
 * @access  Private
 */
exports.deletePlan = asyncHandler(async (req, res, next) => {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Make sure user owns the plan
    if (plan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to delete this plan' });
    }

    await plan.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
