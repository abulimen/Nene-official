const { BlogPost } = require('../models').models;

const getBlogPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            where: { is_published: true },
            order: [['published_at', 'DESC']]
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

const getBlogPostById = async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            where: {
                id: req.params.id,
                is_published: true
            }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Blog post not found'
                }
            });
        }

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
