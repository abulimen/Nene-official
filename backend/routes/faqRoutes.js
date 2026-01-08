const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Public routes
router.get('/faqs', faqController.getAllFAQs);

module.exports = router;
