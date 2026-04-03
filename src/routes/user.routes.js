const express = require('express');
const {
    getMe,
    updateUserDetails,
    deleteUser
} = require('../controllers/user.controller');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/me', getMe);
router.put('/update-details', updateUserDetails);
router.delete('/:id', deleteUser);

module.exports = router;
