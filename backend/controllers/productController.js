const { Product, Review, ProductImage, ProductVariation } = require('../models').models;

const getProducts = async (req, res) => {
    try {
        const products = await Product.scope('active').findAll({
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'is_primary', 'display_order']
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    attributes: ['id', 'name', 'price', 'sku', 'is_available', 'sort_order'],
                    order: [['sort_order', 'ASC']]
                }
            ]
        });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching products'
            }
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.scope('active').findByPk(req.params.id, {
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'is_primary', 'display_order']
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    attributes: ['id', 'name', 'price', 'sku', 'is_available', 'sort_order'],
                    order: [['sort_order', 'ASC']]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching product'
            }
        });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.scope('approved').findAll({
            where: { product_id: req.params.id },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching reviews'
            }
        });
    }
};

const getFeaturedReviews = async (req, res) => {
    try {
        const reviews = await Review.scope('approved').findAll({
            where: { is_featured: true },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'image_url']
            }],
            order: [['updated_at', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching featured reviews:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching featured reviews'
            }
        });
    }
};

const submitReview = async (req, res) => {
    try {
        const { product_id, customer_name, customer_email, rating, review_text } = req.body;

        // Basic validation
        if (!product_id || !customer_name || !rating || !review_text) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields'
                }
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Rating must be between 1 and 5'
                }
            });
        }

        const review = await Review.create({
            product_id,
            customer_name,
            customer_email,
            rating,
            review_text,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully and is pending approval',
            data: review
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error submitting review'
            }
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductReviews,
    getFeaturedReviews,
    submitReview
};
