const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateCustomer } = require('../middleware/customerAuth');

// All cart routes require customer authentication
router.use(authenticateCustomer);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:product_id', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/sync', cartController.syncCart);

module.exports = router;
