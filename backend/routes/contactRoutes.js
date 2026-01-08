const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public routes
router.get('/info', contactController.getContactInfo);
router.post('/message', contactController.submitMessage);

module.exports = router;
