const { supabase } = require('../utils/supabase');

const validateDiscount = async (req, res) => {
    try {
        const { code, order_amount } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Discount code is required'
                }
            });
        }

        // Find active, non-expired discount code
        const { data: discount, error } = await supabase
            .from('discount_codes')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();

        if (error || !discount) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INVALID_CODE',
                    message: 'Invalid or expired discount code'
                }
            });
        }

        // Check if expired
        if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'INVALID_CODE',
                    message: 'Invalid or expired discount code'
                }
            });
        }

        // Check usage limit
        if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USAGE_LIMIT_EXCEEDED',
                    message: 'This discount code has reached its usage limit'
                }
            });
        }

        // Check minimum order amount
        if (order_amount && discount.minimum_order_amount > order_amount) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MINIMUM_ORDER_NOT_MET',
                    message: `Minimum order amount of ₦${discount.minimum_order_amount} not met`
                }
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.discount_type === 'percentage') {
            discountAmount = (order_amount * discount.discount_value) / 100;
        } else {
            discountAmount = discount.discount_value;
        }

        // Ensure discount doesn't exceed order amount
        if (discountAmount > order_amount) {
            discountAmount = order_amount;
        }

        res.json({
            success: true,
            data: {
                id: discount.id,
                code: discount.code,
                type: discount.discount_type,
                value: discount.discount_value,
                amount: parseFloat(discountAmount),
                new_total: parseFloat(order_amount - discountAmount)
            }
        });
    } catch (error) {
        console.error('Error validating discount code:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error validating discount code'
            }
        });
    }
};

module.exports = {
    validateDiscount
};
