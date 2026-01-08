const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/blog', blogController.getBlogPosts);
router.get('/blog/:id', blogController.getBlogPostById);

module.exports = router;
