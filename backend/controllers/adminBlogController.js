const { BlogPost } = require('../models').models;

const getBlogPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            order: [['created_at', 'DESC']]
        });

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
        const post = await BlogPost.create(req.body);
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
        const post = await BlogPost.findByPk(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Blog post not found'
                }
            });
        }

        await post.update(req.body);

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
        const post = await BlogPost.findByPk(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Blog post not found'
                }
            });
        }

        await post.destroy();

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
