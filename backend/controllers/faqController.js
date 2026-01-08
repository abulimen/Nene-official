const FAQ = require('../models/FAQ');

// Public: Get all active FAQs
exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.findAll({
            where: { is_active: true },
            order: [['display_order', 'ASC'], ['created_at', 'DESC']],
            attributes: ['id', 'question', 'answer', 'category', 'display_order']
        });

        res.json({
            success: true,
            data: faqs
        });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch FAQs'
            }
        });
    }
};

// Admin: Get all FAQs (including inactive)
exports.getAdminFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.findAll({
            order: [['display_order', 'ASC'], ['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: faqs
        });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch FAQs'
            }
        });
    }
};

// Admin: Create FAQ
exports.createFAQ = async (req, res) => {
    try {
        const { question, answer, category, display_order, is_active } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Question and answer are required'
                }
            });
        }

        const faq = await FAQ.create({
            question,
            answer,
            category: category || null,
            display_order: display_order || 0,
            is_active: is_active !== undefined ? is_active : true
        });

        res.status(201).json({
            success: true,
            data: faq
        });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to create FAQ'
            }
        });
    }
};

// Admin: Update FAQ
exports.updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category, display_order, is_active } = req.body;

        const faq = await FAQ.findByPk(id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'FAQ not found'
                }
            });
        }

        await faq.update({
            question: question || faq.question,
            answer: answer || faq.answer,
            category: category !== undefined ? category : faq.category,
            display_order: display_order !== undefined ? display_order : faq.display_order,
            is_active: is_active !== undefined ? is_active : faq.is_active
        });

        res.json({
            success: true,
            data: faq
        });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to update FAQ'
            }
        });
    }
};

// Admin: Delete FAQ
exports.deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findByPk(id);
        if (!faq) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'FAQ not found'
                }
            });
        }

        await faq.destroy();

        res.json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to delete FAQ'
            }
        });
    }
};
