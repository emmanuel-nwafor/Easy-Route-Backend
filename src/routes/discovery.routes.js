const express = require('express');
const { searchRoutes, getAllRoutes } = require('../controllers/discovery.controller');

const router = express.Router();

router.get('/search', searchRoutes);
router.get('/all', getAllRoutes);

module.exports = router;
