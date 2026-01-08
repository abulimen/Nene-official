const axios = require('axios');
const crypto = require('crypto');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const initializeTransaction = async (email, amount, callbackUrl, metadata = {}) => {
    try {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email,
                amount: Math.round(amount * 100), // Convert to kobo
                callback_url: callbackUrl,
                metadata
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.data;
    } catch (error) {
        console.error('Paystack initialization error:', error.response?.data || error.message);
        throw new Error('Payment initialization failed');
    }
};

const verifyTransaction = async (reference) => {
    try {
        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        return response.data.data;
    } catch (error) {
        console.error('Paystack verification error:', error.response?.data || error.message);
        throw new Error('Payment verification failed');
    }
};

const verifySignature = (signature, body) => {
    const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(body))
        .digest('hex');

    return hash === signature;
};

module.exports = {
    initializeTransaction,
    verifyTransaction,
    verifySignature
};
