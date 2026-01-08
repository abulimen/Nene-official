const { ShippingConfig, SocialMediaLink } = require('../models').models;

const getShippingStates = async (req, res) => {
    try {
        const states = await ShippingConfig.findAll({
            where: { is_active: true },
            order: [['state_name', 'ASC']]
        });
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
        const links = await SocialMediaLink.findAll({
            where: { is_active: true },
            order: [['display_order', 'ASC']]
        });
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
