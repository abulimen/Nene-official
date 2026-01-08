const { ShippingConfig, DiscountCode, SocialMediaLink, TelegramConfig, ContactInfo } = require('../models').models;
const telegramService = require('../services/telegramService');

// Shipping
const getShippingConfigs = async (req, res) => {
    try {
        const configs = await ShippingConfig.findAll({ order: [['state_name', 'ASC']] });
        res.json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error fetching shipping configs' } });
    }
};

const createShippingConfig = async (req, res) => {
    try {
        const config = await ShippingConfig.create(req.body);
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error creating shipping config' } });
    }
};

const updateShippingConfig = async (req, res) => {
    try {
        const config = await ShippingConfig.findByPk(req.params.id);
        if (!config) return res.status(404).json({ success: false, error: { message: 'Config not found' } });
        await config.update(req.body);
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error updating shipping config' } });
    }
};

const deleteShippingConfig = async (req, res) => {
    try {
        const config = await ShippingConfig.findByPk(req.params.id);
        if (!config) return res.status(404).json({ success: false, error: { message: 'Config not found' } });
        await config.destroy();
        res.json({ success: true, message: 'Config deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error deleting shipping config' } });
    }
};

// Discounts
const getDiscounts = async (req, res) => {
    try {
        const discounts = await DiscountCode.findAll({ order: [['created_at', 'DESC']] });
        res.json({ success: true, data: discounts });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error fetching discounts' } });
    }
};

const createDiscount = async (req, res) => {
    try {
        const { code, type, value, min_order_amount, usage_limit, expires_at } = req.body;

        const discountData = {
            code,
            discount_type: type,
            discount_value: value,
            minimum_order_amount: min_order_amount === '' ? 0 : min_order_amount,
            usage_limit: usage_limit === '' ? null : usage_limit,
            expires_at: expires_at === '' ? null : expires_at
        };

        const discount = await DiscountCode.create(discountData);
        res.status(201).json({ success: true, data: discount });
    } catch (error) {
        console.error('Error creating discount:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: { message: 'Discount code already exists' } });
        }
        res.status(500).json({ success: false, error: { message: 'Error creating discount' } });
    }
};

const updateDiscount = async (req, res) => {
    try {
        const discount = await DiscountCode.findByPk(req.params.id);
        if (!discount) return res.status(404).json({ success: false, error: { message: 'Discount not found' } });

        const { code, type, value, min_order_amount, usage_limit, expires_at, is_active } = req.body;

        const discountData = {
            code,
            discount_type: type,
            discount_value: value,
            minimum_order_amount: min_order_amount === '' ? 0 : min_order_amount,
            usage_limit: usage_limit === '' ? null : usage_limit,
            expires_at: expires_at === '' ? null : expires_at,
            is_active
        };

        // Remove undefined keys to avoid overwriting with undefined
        Object.keys(discountData).forEach(key => discountData[key] === undefined && delete discountData[key]);

        await discount.update(discountData);
        res.json({ success: true, data: discount });
    } catch (error) {
        console.error('Error updating discount:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, error: { message: 'Discount code already exists' } });
        }
        res.status(500).json({ success: false, error: { message: 'Error updating discount' } });
    }
};

const deleteDiscount = async (req, res) => {
    try {
        const discount = await DiscountCode.findByPk(req.params.id);
        if (!discount) return res.status(404).json({ success: false, error: { message: 'Discount not found' } });
        await discount.update({ is_active: false }); // Soft delete
        res.json({ success: true, message: 'Discount deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error deleting discount' } });
    }
};

// Social Media
const getSocialMedia = async (req, res) => {
    try {
        const links = await SocialMediaLink.findAll({ order: [['display_order', 'ASC']] });
        res.json({ success: true, data: links });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error fetching social media links' } });
    }
};

const createSocialMedia = async (req, res) => {
    try {
        const link = await SocialMediaLink.create(req.body);
        res.status(201).json({ success: true, data: link });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error creating social media link' } });
    }
};

const updateSocialMedia = async (req, res) => {
    try {
        const link = await SocialMediaLink.findByPk(req.params.id);
        if (!link) return res.status(404).json({ success: false, error: { message: 'Link not found' } });
        await link.update(req.body);
        res.json({ success: true, data: link });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error updating social media link' } });
    }
};

const deleteSocialMedia = async (req, res) => {
    try {
        const link = await SocialMediaLink.findByPk(req.params.id);
        if (!link) return res.status(404).json({ success: false, error: { message: 'Link not found' } });
        await link.destroy();
        res.json({ success: true, message: 'Link deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error deleting social media link' } });
    }
};

// Telegram Config
const getTelegramConfig = async (req, res) => {
    try {
        let config = await TelegramConfig.findOne();
        if (!config) {
            config = { bot_token: '', chat_id: '', is_enabled: false, notify_on_purchase: true, notify_on_review: true };
        }
        // Mask the token for security
        const safeConfig = {
            ...config.dataValues || config,
            bot_token: config.bot_token ? '***' + config.bot_token.slice(-6) : ''
        };
        res.json({ success: true, data: safeConfig });
    } catch (error) {
        console.error('Error fetching Telegram config:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching Telegram config' } });
    }
};

const updateTelegramConfig = async (req, res) => {
    try {
        const { bot_token, chat_id, is_enabled, notify_on_purchase, notify_on_review } = req.body;

        let config = await TelegramConfig.findOne();

        const updateData = { chat_id, is_enabled, notify_on_purchase, notify_on_review };
        // Only update token if a new one is provided (not masked)
        if (bot_token && !bot_token.startsWith('***')) {
            updateData.bot_token = bot_token;
        }

        if (!config) {
            if (bot_token && !bot_token.startsWith('***')) {
                updateData.bot_token = bot_token;
            }
            config = await TelegramConfig.create(updateData);
        } else {
            await config.update(updateData);
        }

        // Return safe version
        const safeConfig = {
            ...config.dataValues,
            bot_token: config.bot_token ? '***' + config.bot_token.slice(-6) : ''
        };
        res.json({ success: true, data: safeConfig });
    } catch (error) {
        console.error('Error updating Telegram config:', error);
        res.status(500).json({ success: false, error: { message: 'Error updating Telegram config' } });
    }
};

const testTelegramMessage = async (req, res) => {
    try {
        const result = await telegramService.sendTestMessage();
        if (result) {
            res.json({ success: true, message: 'Test message sent successfully!' });
        } else {
            res.status(400).json({ success: false, error: { message: 'Failed to send test message. Check your bot token and chat ID.' } });
        }
    } catch (error) {
        console.error('Error sending test message:', error);
        res.status(500).json({ success: false, error: { message: 'Error sending test message' } });
    }
};

// Contact Info (Admin)
const getContactInfo = async (req, res) => {
    try {
        let info = await ContactInfo.findOne();
        if (!info) {
            info = {
                phone: '', email: '', address: '', business_hours: '', whatsapp: '', city: '',
                hero_title: 'Handcrafted with Love',
                hero_subtitle: 'Discover our artisanal yogurt collection, made fresh daily with premium ingredients.',
                footer_tagline: 'Handcrafted artisanal yogurt made with love and premium ingredients.'
            };
        }
        res.json({ success: true, data: info });
    } catch (error) {
        console.error('Error fetching contact info:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching contact info' } });
    }
};

const updateContactInfo = async (req, res) => {
    try {
        const { phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline } = req.body;

        let info = await ContactInfo.findOne();
        if (!info) {
            info = await ContactInfo.create({ phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline });
        } else {
            await info.update({ phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline });
            await info.reload();
        }

        res.json({ success: true, data: info });
    } catch (error) {
        console.error('Error updating contact info:', error);
        res.status(500).json({ success: false, error: { message: 'Error updating contact info' } });
    }
};

module.exports = {
    getShippingConfigs, createShippingConfig, updateShippingConfig, deleteShippingConfig,
    getDiscounts, createDiscount, updateDiscount, deleteDiscount,
    getSocialMedia, createSocialMedia, updateSocialMedia, deleteSocialMedia,
    getTelegramConfig, updateTelegramConfig, testTelegramMessage,
    getContactInfo, updateContactInfo
};
