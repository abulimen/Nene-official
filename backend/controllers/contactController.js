const { supabase } = require('../utils/supabase');
const telegramService = require('../services/telegramService');

// Public: Get contact info
const getContactInfo = async (req, res) => {
    try {
        const { data: info, error } = await supabase
            .from('contact_info')
            .select('*')
            .single();

        if (error && error.code === 'PGRST116') {
            // No row found, return default
            return res.json({
                success: true,
                data: {
                    phone: '+234 800 123 4567',
                    email: 'hello@nene.ng',
                    address: '123 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
                    business_hours: 'Mon-Fri 9am to 5pm',
                    whatsapp: null
                }
            });
        }
        if (error) throw error;

        res.json({ success: true, data: info });
    } catch (error) {
        console.error('Error fetching contact info:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching contact info' } });
    }
};

// Admin: Update contact info
const updateContactInfo = async (req, res) => {
    try {
        const { phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline } = req.body;

        // Check if contact info exists
        const { data: existing, error: fetchError } = await supabase
            .from('contact_info')
            .select('id')
            .limit(1);

        let info;
        if (!existing || existing.length === 0) {
            // Create new
            const { data, error } = await supabase
                .from('contact_info')
                .insert({ phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline })
                .select()
                .single();
            if (error) throw error;
            info = data;
        } else {
            // Update existing
            const { data, error } = await supabase
                .from('contact_info')
                .update({ phone, email, address, business_hours, whatsapp, city, hero_title, hero_subtitle, footer_tagline })
                .eq('id', existing[0].id)
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

// Public: Submit contact message
const submitMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: { message: 'All fields are required' }
            });
        }

        const { data: contactMessage, error } = await supabase
            .from('contact_messages')
            .insert({
                name,
                email,
                phone: phone || null,
                subject,
                message
            })
            .select()
            .single();

        if (error) throw error;

        // Send Telegram notification if enabled
        try {
            await telegramService.notifyNewContactMessage(contactMessage);
        } catch (telegramError) {
            console.error('Telegram notification failed:', telegramError);
        }

        // Send email notification to admin
        try {
            const { data: contactInfo } = await supabase
                .from('contact_info')
                .select('email')
                .single();

            const adminEmail = contactInfo?.email || process.env.ADMIN_EMAIL;

            if (adminEmail) {
                const emailService = require('../services/emailService');
                await emailService.sendContactNotification(contactMessage, adminEmail);
            }
        } catch (emailError) {
            console.error('Email notification failed:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for your message. We will get back to you shortly.',
            data: { id: contactMessage.id }
        });
    } catch (error) {
        console.error('Error submitting contact message:', error);
        res.status(500).json({ success: false, error: { message: 'Error submitting message' } });
    }
};

// Admin: Get all messages
const getMessages = async (req, res) => {
    try {
        const { page = 1, limit = 20, unread_only = false } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('contact_messages')
            .select('*', { count: 'exact' });

        if (unread_only === 'true') {
            query = query.eq('is_read', false);
        }

        const { data: rows, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching messages' } });
    }
};

// Admin: Get single message
const getMessage = async (req, res) => {
    try {
        const { data: message, error } = await supabase
            .from('contact_messages')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ success: false, error: { message: 'Message not found' } });
        }
        if (error) throw error;

        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching message' } });
    }
};

// Admin: Mark message as read
const markAsRead = async (req, res) => {
    try {
        const { data: message, error } = await supabase
            .from('contact_messages')
            .update({ is_read: true })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ success: false, error: { message: 'Message not found' } });
        }
        if (error) throw error;

        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ success: false, error: { message: 'Error updating message' } });
    }
};

// Admin: Delete message
const deleteMessage = async (req, res) => {
    try {
        // Check if exists
        const { data: existing, error: fetchError } = await supabase
            .from('contact_messages')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !existing) {
            return res.status(404).json({ success: false, error: { message: 'Message not found' } });
        }

        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, error: { message: 'Error deleting message' } });
    }
};

// Admin: Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const { count, error } = await supabase
            .from('contact_messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (error) throw error;

        res.json({ success: true, data: { count } });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ success: false, error: { message: 'Error getting unread count' } });
    }
};

module.exports = {
    getContactInfo,
    updateContactInfo,
    submitMessage,
    getMessages,
    getMessage,
    markAsRead,
    deleteMessage,
    getUnreadCount
};
