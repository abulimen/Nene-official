const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
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

// Public routes
router.post('/login', loginLimiter, authController.login);
router.post('/verify-2fa', loginLimiter, authController.verify2FA);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/change-email', authenticate, authController.changeEmail);
router.post('/enable-2fa', authenticate, authController.enable2FA);
router.post('/disable-2fa', authenticate, authController.disable2FA);

module.exports = router;

