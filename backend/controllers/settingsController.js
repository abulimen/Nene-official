const { supabase } = require('../utils/supabase');

const getShippingStates = async (req, res) => {
    try {
        const { data: states, error } = await supabase
            .from('shipping_config')
            .select('*')
            .eq('is_active', true)
            .order('state_name', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            data: states
        });
    } catch (error) {
        console.error('Error fetching shipping states:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching shipping states'
            }
        });
    }
};

const getSocialMediaLinks = async (req, res) => {
    try {
        const { data: links, error } = await supabase
            .from('social_media_links')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            data: links
        });
    } catch (error) {
        console.error('Error fetching social media links:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching social media links'
            }
        });
    }
};

module.exports = {
    getShippingStates,
    getSocialMediaLinks
};
