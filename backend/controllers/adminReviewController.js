const { supabase } = require('../utils/supabase');

const getReviews = async (req, res) => {
    try {
        const { status, product_id } = req.query;

        let query = supabase
            .from('reviews')
            .select(`
                *,
                product:products(name, image_url)
            `)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (product_id) query = query.eq('product_id', product_id);

        const { data: reviews, error } = await query;

        if (error) throw error;

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

        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Review not found'
                }
            });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

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

        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Review not found'
                }
            });
        }

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;

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

        const { data: review } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (!review) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Review not found'
                }
            });
        }

        const { data: updated, error } = await supabase
            .from('reviews')
            .update({ is_featured: !review.is_featured })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: updated,
            message: `Review ${updated.is_featured ? 'featured' : 'unfeatured'} successfully`
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
