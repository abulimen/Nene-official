const { Review, Product } = require('../models').models;

const getReviews = async (req, res) => {
    try {
        const { status, product_id } = req.query;
        const where = {};

        if (status) where.status = status;
        if (product_id) where.product_id = product_id;

        const reviews = await Review.findAll({
            where,
            include: [{
                model: Product,
                as: 'product',
                attributes: ['name', 'image_url']
            }],
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

const updateReviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Review not found'
                }
            });
        }

        await review.update({ status });

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating review'
            }
        });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Review not found'
                }
            });
        }

        await review.destroy();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error deleting review'
            }
        });
    }
};

const toggleFeaturedReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Review not found'
                }
            });
        }

        await review.update({ is_featured: !review.is_featured });

        res.json({
            success: true,
            data: review,
            message: `Review ${review.is_featured ? 'featured' : 'unfeatured'} successfully`
        });
    } catch (error) {
        console.error('Error toggling featured review:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error toggling featured review'
            }
        });
    }
};

module.exports = {
    getReviews,
    updateReviewStatus,
    deleteReview,
    toggleFeaturedReview
};
