const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/:id/reviews', productController.getProductReviews);
router.get('/reviews/featured', productController.getFeaturedReviews);
router.post('/reviews', productController.submitReview);

module.exports = router;
