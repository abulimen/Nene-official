const { supabase } = require('../utils/supabase');

const getProducts = async (req, res) => {
    try {
        // Get active products with their images and variations
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                images:product_images(id, image_url, is_primary, display_order),
                variations:product_variations(id, name, price, sku, is_available, sort_order)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Sort variations within each product
        products.forEach(product => {
            if (product.variations) {
                product.variations.sort((a, b) => a.sort_order - b.sort_order);
            }
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
        const { data: product, error } = await supabase
            .from('products')
            .select(`
                *,
                images:product_images(id, image_url, is_primary, display_order),
                variations:product_variations(id, name, price, sku, is_available, sort_order)
            `)
            .eq('id', req.params.id)
            .eq('is_active', true)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }
        if (error) throw error;

        // Sort variations
        if (product.variations) {
            product.variations.sort((a, b) => a.sort_order - b.sort_order);
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
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', req.params.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

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

const getFeaturedReviews = async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                product:products(id, name, image_url)
            `)
            .eq('status', 'approved')
            .eq('is_featured', true)
            .order('updated_at', { ascending: false })
            .limit(10);

        if (error) throw error;

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

        const { data: review, error } = await supabase
            .from('reviews')
            .insert({
                product_id,
                customer_name,
                customer_email,
                rating,
                review_text,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

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
