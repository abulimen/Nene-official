const { supabase } = require('../utils/supabase');
const telegramService = require('../services/telegramService');

// Shipping
const getShippingConfigs = async (req, res) => {
    try {
        const { data: configs, error } = await supabase
            .from('shipping_config')
            .select('*')
            .order('state_name', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error fetching shipping configs' } });
    }
};

const createShippingConfig = async (req, res) => {
    try {
        const { data: config, error } = await supabase
            .from('shipping_config')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error creating shipping config' } });
    }
};

const updateShippingConfig = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('shipping_config')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) return res.status(404).json({ success: false, error: { message: 'Config not found' } });

        const { data: config, error } = await supabase
            .from('shipping_config')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error updating shipping config' } });
    }
};

const deleteShippingConfig = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('shipping_config')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) return res.status(404).json({ success: false, error: { message: 'Config not found' } });

        const { error } = await supabase
            .from('shipping_config')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'Config deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error deleting shipping config' } });
    }
};

// Discounts
const getDiscounts = async (req, res) => {
    try {
        const { data: discounts, error } = await supabase
            .from('discount_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
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

        const { data: discount, error } = await supabase
            .from('discount_codes')
            .insert(discountData)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return res.status(400).json({ success: false, error: { message: 'Discount code already exists' } });
            }
            throw error;
        }
        res.status(201).json({ success: true, data: discount });
    } catch (error) {
        console.error('Error creating discount:', error);
        res.status(500).json({ success: false, error: { message: 'Error creating discount' } });
    }
};

const updateDiscount = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('discount_codes')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) return res.status(404).json({ success: false, error: { message: 'Discount not found' } });

        const { code, type, value, min_order_amount, usage_limit, expires_at, is_active } = req.body;

        const discountData = {};
        if (code !== undefined) discountData.code = code;
        if (type !== undefined) discountData.discount_type = type;
        if (value !== undefined) discountData.discount_value = value;
        if (min_order_amount !== undefined) discountData.minimum_order_amount = min_order_amount === '' ? 0 : min_order_amount;
        if (usage_limit !== undefined) discountData.usage_limit = usage_limit === '' ? null : usage_limit;
        if (expires_at !== undefined) discountData.expires_at = expires_at === '' ? null : expires_at;
        if (is_active !== undefined) discountData.is_active = is_active;

        const { data: discount, error } = await supabase
            .from('discount_codes')
            .update(discountData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ success: false, error: { message: 'Discount code already exists' } });
            }
            throw error;
        }
        res.json({ success: true, data: discount });
    } catch (error) {
        console.error('Error updating discount:', error);
        res.status(500).json({ success: false, error: { message: 'Error updating discount' } });
    }
};

const deleteDiscount = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('discount_codes')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) return res.status(404).json({ success: false, error: { message: 'Discount not found' } });

        // Soft delete
        const { error } = await supabase
            .from('discount_codes')
            .update({ is_active: false })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'Discount deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error deleting discount' } });
    }
};

// Social Media
const getSocialMedia = async (req, res) => {
    try {
        const { data: links, error } = await supabase
            .from('social_media_links')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        res.json({ success: true, data: links });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error fetching social media links' } });
    }
};

const createSocialMedia = async (req, res) => {
    try {
        const { data: link, error } = await supabase
            .from('social_media_links')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ success: true, data: link });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error creating social media link' } });
    }
};

const updateSocialMedia = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('social_media_links')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) return res.status(404).json({ success: false, error: { message: 'Link not found' } });

        const { data: link, error } = await supabase
            .from('social_media_links')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data: link });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error updating social media link' } });
    }
};

const deleteSocialMedia = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('social_media_links')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) return res.status(404).json({ success: false, error: { message: 'Link not found' } });

        const { error } = await supabase
            .from('social_media_links')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true, message: 'Link deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: 'Error deleting social media link' } });
    }
};

// Telegram Config
const getTelegramConfig = async (req, res) => {
    try {
        const { data: config } = await supabase
            .from('telegram_config')
            .select('*')
            .single();

        const safeConfig = config ? {
            ...config,
            bot_token: config.bot_token ? '***' + config.bot_token.slice(-6) : ''
        } : {
            bot_token: '', chat_id: '', is_enabled: false, notify_on_purchase: true, notify_on_review: true
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

        const { data: existing } = await supabase
            .from('telegram_config')
            .select('*')
            .single();

        const updateData = { chat_id, is_enabled, notify_on_purchase, notify_on_review };
        if (bot_token && !bot_token.startsWith('***')) {
            updateData.bot_token = bot_token;
        }

        let config;
        if (!existing) {
            const { data, error } = await supabase
                .from('telegram_config')
                .insert(updateData)
                .select()
                .single();
            if (error) throw error;
            config = data;
        } else {
            const { data, error } = await supabase
                .from('telegram_config')
                .update(updateData)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            config = data;
        }

        const safeConfig = {
            ...config,
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
            res.status(400).json({ success: false, error: { message: 'Failed to send test message.' } });
        }
    } catch (error) {
        console.error('Error sending test message:', error);
        res.status(500).json({ success: false, error: { message: 'Error sending test message' } });
    }
};

// Contact Info
const getContactInfo = async (req, res) => {
    try {
        const { data: info } = await supabase
            .from('contact_info')
            .select('*')
            .single();

        const result = info || {
            phone: '', email: '', address: '', business_hours: '', whatsapp: '', city: '',
            hero_title: 'Handcrafted with Love',
            hero_subtitle: 'Discover our artisanal yogurt collection, made fresh daily with premium ingredients.',
            footer_tagline: 'Handcrafted artisanal yogurt made with love and premium ingredients.'
        };

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error fetching contact info:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching contact info' } });
    }
};

const updateContactInfo = async (req, res) => {
    try {
        const { phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline } = req.body;

        const { data: existing } = await supabase
            .from('contact_info')
            .select('id')
            .single();

        let info;
        if (!existing) {
            const { data, error } = await supabase
                .from('contact_info')
                .insert({ phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline })
                .select()
                .single();
            if (error) throw error;
            info = data;
        } else {
            const { data, error } = await supabase
                .from('contact_info')
                .update({ phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            info = data;
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
