const express = require('express');
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notification.controller');

const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
    .get(getUserNotifications);

router.route('/readall')
    .put(markAllAsRead);

router.route('/:id/read')
    .put(markAsRead);

module.exports = router;
