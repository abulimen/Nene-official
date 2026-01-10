const { supabase } = require('../utils/supabase');

// Get current config from database
const getConfig = async () => {
    try {
        const { data: config } = await supabase
            .from('telegram_config')
            .select('*')
            .single();
        return config;
    } catch (error) {
        console.error('Error fetching Telegram config:', error);
        return null;
    }
};

// Send a message to the configured Telegram chat
const sendMessage = async (text) => {
    try {
        const config = await getConfig();

        if (!config || !config.is_enabled || !config.bot_token || !config.chat_id) {
            console.log('Telegram not configured or disabled');
            return null;
        }

        const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: config.chat_id,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return null;
    }
};

// Send test message
const sendTestMessage = async () => {
    return sendMessage('🧪 <b>Test Message</b>\n\nYour Nené Telegram notifications are working correctly!');
};

// Notify on new purchase
const notifyNewPurchase = async (order) => {
    try {
        const config = await getConfig();
        if (!config || !config.notify_on_purchase) return null;

        const itemsList = order.items?.map(item =>
            `  • ${item.product_name} x${item.quantity}`
        ).join('\n') || 'Items not available';

        const message = `🛒 <b>New Order!</b>

<b>Order:</b> #${order.order_number}
<b>Customer:</b> ${order.customer_first_name} ${order.customer_last_name}
<b>Email:</b> ${order.customer_email}
<b>Phone:</b> ${order.customer_phone || 'N/A'}

<b>Items:</b>
${itemsList}

<b>Total:</b> ₦${parseFloat(order.total_amount).toLocaleString()}
<b>Shipping:</b> ${order.shipping_city}, ${order.shipping_state}

🎉 Time to prepare this order!`;

        return sendMessage(message);
    } catch (error) {
        console.error('Error sending purchase notification:', error);
        return null;
    }
};

// Notify on new review
const notifyNewReview = async (review) => {
    try {
        const config = await getConfig();
        if (!config || !config.notify_on_review) return null;

        const stars = '⭐'.repeat(review.rating);

        const message = `📝 <b>New Review!</b>

<b>Product:</b> ${review.product?.name || 'Unknown Product'}
<b>Rating:</b> ${stars} (${review.rating}/5)
<b>Customer:</b> ${review.customer_name}

<b>Review:</b>
"${review.comment}"

${review.rating >= 4 ? '🎉 Another happy customer!' : '👀 Might need attention'}`;

        return sendMessage(message);
    } catch (error) {
        console.error('Error sending review notification:', error);
        return null;
    }
};

// Notify on new contact message
const notifyNewContactMessage = async (contactMessage) => {
    try {
        const config = await getConfig();
        if (!config || !config.is_enabled) return null;

        const message = `📬 <b>New Contact Message!</b>

<b>From:</b> ${contactMessage.name}
<b>Email:</b> ${contactMessage.email}${contactMessage.phone ? `
<b>Phone:</b> ${contactMessage.phone}` : ''}
<b>Subject:</b> ${contactMessage.subject}

<b>Message:</b>
"${contactMessage.message.substring(0, 500)}${contactMessage.message.length > 500 ? '...' : ''}"

📱 Check admin dashboard to respond.`;

        return sendMessage(message);
    } catch (error) {
        console.error('Error sending contact message notification:', error);
        return null;
    }
};

module.exports = {
    getConfig,
    sendMessage,
    sendTestMessage,
    notifyNewPurchase,
    notifyNewReview,
    notifyNewContactMessage
};
