const { ContactInfo, ContactMessage, TelegramConfig } = require('../models').models;
const telegramService = require('../services/telegramService');

// Public: Get contact info
const getContactInfo = async (req, res) => {
    try {
        let info = await ContactInfo.findOne();
        if (!info) {
            // Return default if none exists
            info = {
                phone: '+234 800 123 4567',
                email: 'hello@nene.ng',
                address: '123 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
                business_hours: 'Mon-Fri 9am to 5pm',
                whatsapp: null
            };
        }
        res.json({ success: true, data: info });
    } catch (error) {
        console.error('Error fetching contact info:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching contact info' } });
    }
};

// Admin: Update contact info
const updateContactInfo = async (req, res) => {
    try {
        const { phone, email, address, business_hours, whatsapp, city } = req.body;

        console.log('Updating contact info with:', { phone, email, address, business_hours, whatsapp, city });

        let info = await ContactInfo.findOne();
        if (!info) {
            info = await ContactInfo.create({ phone, email, address, business_hours, whatsapp, city });
        } else {
            await info.update({ phone, email, address, business_hours, whatsapp, city });
            // Reload to get updated values
            await info.reload();
        }

        console.log('Updated info:', info.toJSON());

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

        const contactMessage = await ContactMessage.create({
            name,
            email,
            phone: phone || null,
            subject,
            message
        });

        // Send Telegram notification if enabled
        try {
            await telegramService.notifyNewContactMessage(contactMessage);
        } catch (telegramError) {
            console.error('Telegram notification failed:', telegramError);
        }

        // Send email notification to admin
        try {
            // Get admin email from contact info or use default
            const contactInfo = await ContactInfo.findOne();
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

        const where = {};
        if (unread_only === 'true') {
            where.is_read = false;
        }

        const { count, rows } = await ContactMessage.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

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
        const message = await ContactMessage.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, error: { message: 'Message not found' } });
        }
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ success: false, error: { message: 'Error fetching message' } });
    }
};

// Admin: Mark message as read
const markAsRead = async (req, res) => {
    try {
        const message = await ContactMessage.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, error: { message: 'Message not found' } });
        }

        await message.update({ is_read: true });
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ success: false, error: { message: 'Error updating message' } });
    }
};

// Admin: Delete message
const deleteMessage = async (req, res) => {
    try {
        const message = await ContactMessage.findByPk(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, error: { message: 'Message not found' } });
        }

        await message.destroy();
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, error: { message: 'Error deleting message' } });
    }
};

// Admin: Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const count = await ContactMessage.count({ where: { is_read: false } });
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
