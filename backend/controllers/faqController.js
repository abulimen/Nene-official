const { supabase } = require('../utils/supabase');

// Public: Get all active FAQs
exports.getAllFAQs = async (req, res) => {
    try {
        const { data: faqs, error } = await supabase
            .from('faqs')
            .select('id, question, answer, category, display_order')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

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
        const { data: faqs, error } = await supabase
            .from('faqs')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

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

        const { data: faq, error } = await supabase
            .from('faqs')
            .insert({
                question,
                answer,
                category: category || null,
                display_order: display_order || 0,
                is_active: is_active !== undefined ? is_active : true
            })
            .select()
            .single();

        if (error) throw error;

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

        // Check if FAQ exists
        const { data: existingFaq, error: fetchError } = await supabase
            .from('faqs')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingFaq) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'FAQ not found'
                }
            });
        }

        const { data: faq, error } = await supabase
            .from('faqs')
            .update({
                question: question || existingFaq.question,
                answer: answer || existingFaq.answer,
                category: category !== undefined ? category : existingFaq.category,
                display_order: display_order !== undefined ? display_order : existingFaq.display_order,
                is_active: is_active !== undefined ? is_active : existingFaq.is_active
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

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

        // Check if FAQ exists
        const { data: existingFaq, error: fetchError } = await supabase
            .from('faqs')
            .select('id')
            .eq('id', id)
            .single();

        if (fetchError || !existingFaq) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'FAQ not found'
                }
            });
        }

        const { error } = await supabase
            .from('faqs')
            .delete()
            .eq('id', id);

        if (error) throw error;

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
