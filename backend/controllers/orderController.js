const { supabase } = require('../utils/supabase');
const paystackService = require('../services/paystackService');
const emailService = require('../services/emailService');

// Helper function to compare cart items with order items
const cartMatchesOrder = (cartItems, orderItems) => {
    if (cartItems.length !== orderItems.length) return false;

    const sortedCart = [...cartItems].sort((a, b) => a.product_id - b.product_id);
    const sortedOrder = [...orderItems].sort((a, b) => a.product_id - b.product_id);

    for (let i = 0; i < sortedCart.length; i++) {
        if (sortedCart[i].product_id !== sortedOrder[i].product_id ||
            sortedCart[i].quantity !== sortedOrder[i].quantity) {
            return false;
        }
    }
    return true;
};

const createOrder = async (req, res) => {
    try {
        const {
            customer_first_name,
            customer_last_name,
            customer_email,
            customer_phone,
            shipping_address,
            shipping_city,
            shipping_state,
            items,
            discount_code,
            notes
        } = req.body;

        // Check for existing pending unpaid orders (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: existingOrders } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('customer_email', customer_email)
            .eq('payment_status', 'pending')
            .eq('order_status', 'pending')
            .gte('created_at', twentyFourHoursAgo)
            .order('created_at', { ascending: false })
            .limit(1);

        const existingPendingOrder = existingOrders?.[0];

        if (existingPendingOrder) {
            const existingOrderItems = existingPendingOrder.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            const currentCartItems = items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            if (cartMatchesOrder(currentCartItems, existingOrderItems)) {
                // Reuse existing order
                console.log(`Reusing existing pending order ${existingPendingOrder.order_number}`);

                const paymentData = await paystackService.initializeTransaction(
                    customer_email,
                    parseFloat(existingPendingOrder.total_amount),
                    `${process.env.FRONTEND_URL}/order-confirmation?order_id=${existingPendingOrder.id}`,
                    {
                        order_id: existingPendingOrder.id,
                        order_number: existingPendingOrder.order_number
                    }
                );

                await supabase
                    .from('orders')
                    .update({ payment_reference: paymentData.reference })
                    .eq('id', existingPendingOrder.id);

                return res.status(200).json({
                    success: true,
                    data: {
                        order_id: existingPendingOrder.id,
                        order_number: existingPendingOrder.order_number,
                        payment_url: paymentData.authorization_url,
                        reference: paymentData.reference,
                        reused_order: true
                    }
                });
            } else {
                // Delete stale pending order
                console.log(`Deleting stale pending order ${existingPendingOrder.order_number}`);

                await supabase.from('order_items').delete().eq('order_id', existingPendingOrder.id);
                await supabase.from('order_status_history').delete().eq('order_id', existingPendingOrder.id);
                await supabase.from('orders').delete().eq('id', existingPendingOrder.id);
            }
        }

        // Validate Items and Calculate Subtotal
        let subtotal = 0;
        const orderItemsData = [];

        for (const item of items) {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', item.product_id)
                .single();

            if (error || !product) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_NOT_FOUND',
                        message: `Product with ID ${item.product_id} not found`
                    }
                });
            }

            if (!product.is_active) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_DELETED',
                        message: `Product "${product.name}" is no longer available`
                    }
                });
            }

            if (!product.is_available) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_OUT_OF_STOCK',
                        message: `Product "${product.name}" is currently out of stock`
                    }
                });
            }

            let itemPrice = parseFloat(product.price);
            let variationId = null;
            let variationName = null;

            if (item.variation_id) {
                const { data: variation } = await supabase
                    .from('product_variations')
                    .select('*')
                    .eq('id', item.variation_id)
                    .single();

                if (variation && variation.product_id === product.id) {
                    if (!variation.is_available) {
                        return res.status(400).json({
                            success: false,
                            error: {
                                code: 'VARIATION_OUT_OF_STOCK',
                                message: `Size "${variation.name}" for "${product.name}" is out of stock`
                            }
                        });
                    }
                    itemPrice = parseFloat(variation.price);
                    variationId = variation.id;
                    variationName = variation.name;
                }
            } else if (item.variation_name) {
                variationName = item.variation_name;
                if (item.price) {
                    itemPrice = parseFloat(item.price);
                }
            }

            const calculatedSubtotal = itemPrice * item.quantity;
            subtotal += calculatedSubtotal;

            orderItemsData.push({
                product_id: product.id,
                product_name: product.name,
                product_price: itemPrice,
                variation_id: variationId,
                variation_name: variationName,
                quantity: item.quantity,
                subtotal: calculatedSubtotal
            });
        }

        // Calculate Shipping Fee
        const { data: shippingConfig } = await supabase
            .from('shipping_config')
            .select('shipping_fee')
            .eq('state_name', shipping_state)
            .eq('is_active', true)
            .single();

        const shippingFee = shippingConfig ? parseFloat(shippingConfig.shipping_fee) : 0;

        // Calculate Discount
        let discountAmount = 0;
        let discountCodeId = null;

        if (discount_code) {
            const { data: discount } = await supabase
                .from('discount_codes')
                .select('*')
                .eq('code', discount_code)
                .eq('is_active', true)
                .single();

            if (discount) {
                if (discount.discount_type === 'percentage') {
                    discountAmount = (subtotal * discount.discount_value) / 100;
                } else {
                    discountAmount = parseFloat(discount.discount_value);
                }
                if (discountAmount > subtotal) discountAmount = subtotal;
                discountCodeId = discount.id;
            }
        }

        const totalAmount = subtotal + shippingFee - discountAmount;
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const orderData = {
            order_number: orderNumber,
            customer_first_name,
            customer_last_name,
            customer_email,
            customer_phone,
            shipping_address,
            shipping_city,
            shipping_state,
            subtotal,
            shipping_fee: shippingFee,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            discount_code_id: discountCodeId,
            notes,
            payment_status: 'pending',
            order_status: 'pending'
        };

        if (req.user && req.user.id) {
            orderData.customer_id = req.user.id;
        }

        // Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) throw orderError;

        // Create Order Items
        for (const itemData of orderItemsData) {
            await supabase.from('order_items').insert({
                ...itemData,
                order_id: order.id
            });
        }

        // Create Initial Status History
        await supabase.from('order_status_history').insert({
            order_id: order.id,
            new_status: 'pending',
            notes: 'Order created'
        });

        // Initialize Paystack Transaction
        const paymentData = await paystackService.initializeTransaction(
            customer_email,
            totalAmount,
            `${process.env.FRONTEND_URL}/order-confirmation?order_id=${order.id}`,
            {
                order_id: order.id,
                order_number: orderNumber
            }
        );

        // Update order with payment reference
        await supabase
            .from('orders')
            .update({ payment_reference: paymentData.reference })
            .eq('id', order.id);

        res.status(201).json({
            success: true,
            data: {
                order_id: order.id,
                order_number: orderNumber,
                payment_url: paymentData.authorization_url,
                reference: paymentData.reference
            }
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error creating order'
            }
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const customer_id = req.user.id;

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('customer_id', customer_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching orders'
            }
        });
    }
};

const verifyPaymentWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];

        if (!paystackService.verifySignature(signature, req.body)) {
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;
            const orderId = metadata.order_id;

            const { data: order } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (order && order.payment_status !== 'paid') {
                await supabase
                    .from('orders')
                    .update({
                        payment_status: 'paid',
                        order_status: 'processing'
                    })
                    .eq('id', orderId);

                await supabase.from('order_status_history').insert({
                    order_id: order.id,
                    old_status: 'pending',
                    new_status: 'processing',
                    notes: 'Payment verified via webhook'
                });

                // Trigger email notification
                try {
                    await emailService.sendOrderConfirmation(order);
                } catch (emailError) {
                    console.error('Failed to send email:', emailError);
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};

const retryPayment = async (req, res) => {
    try {
        const orderId = req.params.id;
        const customerId = req.user.id;

        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }
            });
        }

        if (order.customer_id !== customerId) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Access denied' }
            });
        }

        if (order.payment_status === 'paid') {
            return res.status(400).json({
                success: false,
                error: { code: 'ALREADY_PAID', message: 'Order already paid' }
            });
        }

        if (order.order_status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: { code: 'ORDER_CANCELLED', message: 'Order is cancelled' }
            });
        }

        const paymentData = await paystackService.initializeTransaction(
            order.customer_email,
            order.total_amount,
            `${process.env.FRONTEND_URL}/order-confirmation?order_id=${order.id}`,
            { order_id: order.id, order_number: order.order_number }
        );

        await supabase
            .from('orders')
            .update({ payment_reference: paymentData.reference })
            .eq('id', order.id);

        res.json({
            success: true,
            data: {
                order_id: order.id,
                order_number: order.order_number,
                payment_url: paymentData.authorization_url,
                reference: paymentData.reference
            }
        });

    } catch (error) {
        console.error('Retry payment error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Error retrying payment' }
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const customerId = req.user.id;

        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }
            });
        }

        if (order.customer_id !== customerId) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Access denied' }
            });
        }

        if (order.payment_status === 'paid') {
            return res.status(400).json({
                success: false,
                error: { code: 'CANNOT_CANCEL', message: 'Cannot cancel paid order' }
            });
        }

        if (order.order_status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: { code: 'ALREADY_CANCELLED', message: 'Already cancelled' }
            });
        }

        await supabase
            .from('orders')
            .update({ order_status: 'cancelled' })
            .eq('id', orderId);

        await supabase.from('order_status_history').insert({
            order_id: order.id,
            old_status: order.order_status,
            new_status: 'cancelled',
            notes: 'Cancelled by customer'
        });

        res.json({ success: true, message: 'Order cancelled successfully' });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Error cancelling order' }
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { reference, order_id } = req.body;
        const customerId = req.user.id;

        if (!reference || !order_id) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_PARAMETERS', message: 'Reference and order ID required' }
            });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select(`*, items:order_items(*)`)
            .eq('id', order_id)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }
            });
        }

        if (order.customer_id !== customerId) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Access denied' }
            });
        }

        // If already paid, return order
        if (order.payment_status === 'paid') {
            const { data: orderWithDetails } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items(
                        *,
                        product:products(image_url)
                    )
                `)
                .eq('id', order_id)
                .single();

            return res.json({ success: true, data: orderWithDetails });
        }

        // Verify with Paystack
        const paymentVerification = await paystackService.verifyTransaction(reference);

        if (!paymentVerification || paymentVerification.status !== 'success') {
            return res.status(400).json({
                success: false,
                error: { code: 'PAYMENT_FAILED', message: 'Payment verification failed' }
            });
        }

        // Update order status
        await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                order_status: 'processing'
            })
            .eq('id', order_id);

        // Add status history
        await supabase.from('order_status_history').insert({
            order_id: order.id,
            old_status: 'pending',
            new_status: 'processing',
            notes: 'Payment verified and confirmed'
        });

        // Clear customer's cart
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', customerId)
            .single();

        if (cart) {
            await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        }

        // Fetch updated order with product details
        const { data: updatedOrder } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(
                    *,
                    product:products(image_url)
                )
            `)
            .eq('id', order_id)
            .single();

        res.json({ success: true, data: updatedOrder });

        // Send notifications asynchronously
        try {
            await emailService.sendOrderConfirmation(updatedOrder);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        try {
            const telegramService = require('../services/telegramService');
            await telegramService.notifyNewPurchase(updatedOrder);
        } catch (telegramError) {
            console.error('Failed to send Telegram notification:', telegramError);
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Error verifying payment' }
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const customerId = req.user.id;

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(
                    *,
                    product:products(image_url)
                )
            `)
            .eq('id', orderId)
            .single();

        if (error || !order) {
            return res.status(404).json({
                success: false,
                error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' }
            });
        }

        if (order.customer_id !== customerId) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Access denied' }
            });
        }

        res.json({ success: true, data: order });

    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Error fetching order' }
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    verifyPaymentWebhook,
    retryPayment,
    cancelOrder,
    verifyPayment,
    getOrderById
};
