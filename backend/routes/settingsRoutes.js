const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/shipping/states', settingsController.getShippingStates);
router.get('/settings/social-media', settingsController.getSocialMediaLinks);

module.exports = router;
