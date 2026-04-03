const express = require('express');
const {
    register,
    getChallenge,
    verifySignature,
    recoverAccount
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', register);
router.get('/challenge/:handle', getChallenge);
router.post('/verify', verifySignature);
router.post('/recover', recoverAccount);

module.exports = router;
