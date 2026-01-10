const { supabase } = require('../utils/supabase');

const getBlogPosts = async (req, res) => {
    try {
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching blog posts'
            }
        });
    }
};

const getBlogPostById = async (req, res) => {
    try {
        const { data: post, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', req.params.id)
            .eq('is_published', true)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Blog post not found'
                }
            });
        }
        if (error) throw error;

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching blog post'
            }
        });
    }
};

module.exports = {
    getBlogPosts,
    getBlogPostById
};
