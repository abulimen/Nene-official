const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const { authenticateCustomer } = require('../middleware/customerAuth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts, please try again after 15 minutes'
        }
    }
});

router.post('/register', customerAuthController.register);
router.post('/login', loginLimiter, customerAuthController.login);
router.post('/google', loginLimiter, customerAuthController.googleLogin);
router.post('/logout', customerAuthController.logout);
router.get('/me', authenticateCustomer, customerAuthController.getMe);

module.exports = router;
