const { supabase } = require('../utils/supabase');

const getBlogPosts = async (req, res) => {
    try {
        const { data: posts, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

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

const createBlogPost = async (req, res) => {
    try {
        const { data: post, error } = await supabase
            .from('blog_posts')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error creating blog post'
            }
        });
    }
};

const updateBlogPost = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: existing } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Blog post not found'
                }
            });
        }

        const { data: post, error } = await supabase
            .from('blog_posts')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating blog post'
            }
        });
    }
};

const deleteBlogPost = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: existing } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('id', id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Blog post not found'
                }
            });
        }

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error deleting blog post'
            }
        });
    }
};

module.exports = {
    getBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost
};
