const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const adminProductController = require('../controllers/adminProductController');
const adminDashboardController = require('../controllers/adminDashboardController');
const adminReviewController = require('../controllers/adminReviewController');
const adminBlogController = require('../controllers/adminBlogController');
const adminSettingsController = require('../controllers/adminSettingsController');
const contactController = require('../controllers/contactController');
const faqController = require('../controllers/faqController');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Dashboard Route (needs to be before auth middleware if public, or after if protected)
// Since it's admin dashboard, it should be protected
router.use(authenticate);

router.get('/dashboard/stats', adminDashboardController.getDashboardStats);

// Order Management
router.get('/orders', adminOrderController.getOrders);
router.get('/orders/:id', adminOrderController.getOrderById);
router.put('/orders/:id/status', adminOrderController.updateOrderStatus);
router.put('/orders/:id', adminOrderController.updateOrder);

// Product Management
router.get('/products', adminProductController.getAllProducts);
router.post('/products', adminProductController.createProduct);
router.put('/products/:id', adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);
router.post('/products/:id/images', adminProductController.addProductImage);
router.delete('/products/:id/images/:imageId', adminProductController.deleteProductImage);

// Product Variations
router.post('/products/:id/variations', adminProductController.createVariation);
router.put('/products/:id/variations/:variationId', adminProductController.updateVariation);
router.delete('/products/:id/variations/:variationId', adminProductController.deleteVariation);

// Image Upload
router.post('/upload', upload.single('image'), uploadController.uploadImage);

// Dashboard
router.get('/dashboard/stats', adminDashboardController.getDashboardStats);

// Review Management
router.get('/reviews', adminReviewController.getReviews);
router.put('/reviews/:id/status', adminReviewController.updateReviewStatus);
router.put('/reviews/:id/feature', adminReviewController.toggleFeaturedReview);
router.delete('/reviews/:id', adminReviewController.deleteReview);

// Blog Management
router.get('/blog', adminBlogController.getBlogPosts);
router.post('/blog', adminBlogController.createBlogPost);
router.put('/blog/:id', adminBlogController.updateBlogPost);
router.delete('/blog/:id', adminBlogController.deleteBlogPost);

// Settings - Shipping
router.get('/shipping', adminSettingsController.getShippingConfigs);
router.post('/shipping', adminSettingsController.createShippingConfig);
router.put('/shipping/:id', adminSettingsController.updateShippingConfig);
router.delete('/shipping/:id', adminSettingsController.deleteShippingConfig);

// Settings - Discounts
router.get('/discounts', adminSettingsController.getDiscounts);
router.post('/discounts', adminSettingsController.createDiscount);
router.put('/discounts/:id', adminSettingsController.updateDiscount);
router.delete('/discounts/:id', adminSettingsController.deleteDiscount);

// Settings - Social Media
router.get('/social-media', adminSettingsController.getSocialMedia);
router.post('/social-media', adminSettingsController.createSocialMedia);
router.put('/social-media/:id', adminSettingsController.updateSocialMedia);
router.delete('/social-media/:id', adminSettingsController.deleteSocialMedia);

// Settings - Telegram
router.get('/telegram', adminSettingsController.getTelegramConfig);
router.put('/telegram', adminSettingsController.updateTelegramConfig);
router.post('/telegram/test', adminSettingsController.testTelegramMessage);

// Settings - Contact Info
router.get('/contact-info', adminSettingsController.getContactInfo);
router.put('/contact-info', adminSettingsController.updateContactInfo);

// Contact Messages
router.get('/messages', contactController.getMessages);
router.get('/messages/unread-count', contactController.getUnreadCount);
router.get('/messages/:id', contactController.getMessage);
router.put('/messages/:id/read', contactController.markAsRead);
router.delete('/messages/:id', contactController.deleteMessage);

// FAQ Management
router.get('/faqs', faqController.getAdminFAQs);
router.post('/faqs', faqController.createFAQ);
router.put('/faqs/:id', faqController.updateFAQ);
router.delete('/faqs/:id', faqController.deleteFAQ);

module.exports = router;

