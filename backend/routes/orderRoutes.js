const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateCustomer } = require('../middleware/customerAuth');

// Public routes (or protected by customer auth if needed)
// createOrder should be protected now
router.post('/create', authenticateCustomer, orderController.createOrder);
router.get('/my-orders', authenticateCustomer, orderController.getMyOrders);
router.get('/:id', authenticateCustomer, orderController.getOrderById);
router.post('/:id/retry-payment', authenticateCustomer, orderController.retryPayment);
router.post('/:id/cancel', authenticateCustomer, orderController.cancelOrder);
router.post('/verify-payment', authenticateCustomer, orderController.verifyPayment);
router.post('/webhook/paystack', orderController.verifyPaymentWebhook);

module.exports = router;
