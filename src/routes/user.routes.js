const express = require('express');
const {
    getMe,
    updateUserDetails,
    deleteUser,
    uploadAvatar
} = require('../controllers/user.controller');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

router.get('/me', getMe);
router.put('/update-details', updateUserDetails);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/:id', deleteUser);

module.exports = router;
