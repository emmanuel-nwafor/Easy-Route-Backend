const express = require('express');
const { searchRoutes } = require('../controllers/discovery.controller');

const router = express.Router();

router.get('/search', searchRoutes);

module.exports = router;
