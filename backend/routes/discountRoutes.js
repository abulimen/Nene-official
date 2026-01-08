const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

router.post('/discount/validate', discountController.validateDiscount);

module.exports = router;
