const { Order, OrderItem, Product, DiscountCode, ShippingConfig, OrderStatusHistory, Cart, CartItem } = require('../models').models;
const paystackService = require('../services/paystackService');
const emailService = require('../services/emailService');
const { sequelize } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// Helper function to compare cart items with order items
const cartMatchesOrder = (cartItems, orderItems) => {
    if (cartItems.length !== orderItems.length) return false;

    // Sort both arrays by product_id for comparison
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
    const t = await sequelize.transaction();

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

        // 0. Check for existing pending unpaid orders for this customer
        const existingPendingOrder = await Order.findOne({
            where: {
                customer_email,
                payment_status: 'pending',
                order_status: 'pending',
                // Only consider orders from the last 24 hours
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            include: [{
                model: OrderItem,
                as: 'items'
            }],
            order: [['createdAt', 'DESC']]
        });

        if (existingPendingOrder) {
            // Check if cart items match the existing order
            const existingOrderItems = existingPendingOrder.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            const currentCartItems = items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            if (cartMatchesOrder(currentCartItems, existingOrderItems)) {
                // Cart matches! Reuse the existing order - generate new payment link
                console.log(`Reusing existing pending order ${existingPendingOrder.order_number} for ${customer_email}`);

                const paymentData = await paystackService.initializeTransaction(
                    customer_email,
                    parseFloat(existingPendingOrder.total_amount),
                    `${process.env.FRONTEND_URL}/order-confirmation?order_id=${existingPendingOrder.id}`,
                    {
                        order_id: existingPendingOrder.id,
                        order_number: existingPendingOrder.order_number
                    }
                );

                // Update the payment reference
                await existingPendingOrder.update({
                    payment_reference: paymentData.reference
                }, { transaction: t });

                await t.commit();

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
                // Cart has changed - DELETE the old pending order completely
                console.log(`Deleting stale pending order ${existingPendingOrder.order_number} - cart items changed`);

                // Delete order items first (foreign key constraint)
                await OrderItem.destroy({
                    where: { order_id: existingPendingOrder.id },
                    transaction: t
                });

                // Delete status history
                await OrderStatusHistory.destroy({
                    where: { order_id: existingPendingOrder.id },
                    transaction: t
                });

                // Delete the order itself
                await existingPendingOrder.destroy({ transaction: t });
            }
        }

        // 1. Validate Items and Calculate Subtotal
        let subtotal = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);

            if (!product) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_NOT_FOUND',
                        message: `Product with ID ${item.product_id} not found`
                    }
                });
            }

            if (!product.is_active) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_DELETED',
                        message: `Product "${product.name}" is no longer available (deleted)`
                    }
                });
            }

            if (!product.is_available) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_OUT_OF_STOCK',
                        message: `Product "${product.name}" is currently out of stock`
                    }
                });
            }

            // Use variation price if provided, otherwise use product price
            let itemPrice = parseFloat(product.price);
            let variationId = null;
            let variationName = null;

            if (item.variation_id) {
                // Import ProductVariation if not already
                const ProductVariation = require('../models/ProductVariation');
                const variation = await ProductVariation.findByPk(item.variation_id);
                if (variation && variation.product_id === product.id) {
                    if (!variation.is_available) {
                        await t.rollback();
                        return res.status(400).json({
                            success: false,
                            error: {
                                code: 'VARIATION_OUT_OF_STOCK',
                                message: `Size "${variation.name}" for "${product.name}" is currently out of stock`
                            }
                        });
                    }
                    itemPrice = parseFloat(variation.price);
                    variationId = variation.id;
                    variationName = variation.name;
                }
            } else if (item.variation_name) {
                // Frontend sent variation name but no ID (for local cart items)
                variationName = item.variation_name;
                // Use the price from the cart if provided
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

        // 2. Calculate Shipping Fee
        const shippingConfig = await ShippingConfig.findOne({
            where: { state_name: shipping_state, is_active: true }
        });

        const shippingFee = shippingConfig ? parseFloat(shippingConfig.shipping_fee) : 0;

        // 3. Calculate Discount
        let discountAmount = 0;
        let discountCodeId = null;

        if (discount_code) {
            const discount = await DiscountCode.findOne({
                where: { code: discount_code, is_active: true }
            });

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

        // 4. Create Order Record
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

        const order = await Order.create(orderData, { transaction: t });

        // 5. Create Order Items
        for (const itemData of orderItemsData) {
            await OrderItem.create({
                ...itemData,
                order_id: order.id
            }, { transaction: t });
        }

        // 6. Create Initial Status History
        await OrderStatusHistory.create({
            order_id: order.id,
            new_status: 'pending',
            notes: 'Order created'
        }, { transaction: t });

        // 7. Initialize Paystack Transaction
        const paymentData = await paystackService.initializeTransaction(
            customer_email,
            totalAmount,
            `${process.env.FRONTEND_URL}/order-confirmation?order_id=${order.id}`, // Callback URL
            {
                order_id: order.id,
                order_number: orderNumber
            }
        );

        // Update order with payment reference
        await order.update({ payment_reference: paymentData.reference }, { transaction: t });

        await t.commit();

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
        await t.rollback();
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

        const orders = await Order.findAll({
            where: { customer_id },
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

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

            const order = await Order.findByPk(orderId);

            if (order && order.payment_status !== 'paid') {
                await order.update({
                    payment_status: 'paid',
                    order_status: 'processing' // Auto-move to processing on payment
                });

                // Add history entry
                await OrderStatusHistory.create({
                    order_id: order.id,
                    old_status: 'pending',
                    new_status: 'processing',
                    notes: 'Payment verified via webhook'
                });

                // Trigger email notification
                try {
                    const emailService = require('../services/emailService');
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

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        // Verify order belongs to customer
        if (order.customer_id !== customerId) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this order'
                }
            });
        }

        // Check if order is already paid
        if (order.payment_status === 'paid') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_PAID',
                    message: 'This order has already been paid'
                }
            });
        }

        // Check if order is cancelled
        if (order.order_status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ORDER_CANCELLED',
                    message: 'This order has been cancelled'
                }
            });
        }

        // Initialize new Paystack transaction
        const paymentData = await paystackService.initializeTransaction(
            order.customer_email,
            order.total_amount,
            `${process.env.FRONTEND_URL}/order-confirmation?order_id=${order.id}`,
            {
                order_id: order.id,
                order_number: order.order_number
            }
        );

        // Update order with new payment reference
        await order.update({ payment_reference: paymentData.reference });

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
            error: {
                code: 'SERVER_ERROR',
                message: 'Error retrying payment'
            }
        });
    }
};

const cancelOrder = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const orderId = req.params.id;
        const customerId = req.user.id;

        const order = await Order.findByPk(orderId);

        if (!order) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        // Verify order belongs to customer
        if (order.customer_id !== customerId) {
            await t.rollback();
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this order'
                }
            });
        }

        // Check if order is already paid
        if (order.payment_status === 'paid') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CANNOT_CANCEL',
                    message: 'Cannot cancel a paid order. Please contact support.'
                }
            });
        }

        // Check if order is already cancelled
        if (order.order_status === 'cancelled') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_CANCELLED',
                    message: 'This order is already cancelled'
                }
            });
        }

        // Update order status to cancelled
        await order.update({ order_status: 'cancelled' }, { transaction: t });

        // Create status history record
        await OrderStatusHistory.create({
            order_id: order.id,
            old_status: order.order_status,
            new_status: 'cancelled',
            notes: 'Order cancelled by customer'
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });

    } catch (error) {
        await t.rollback();
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error cancelling order'
            }
        });
    }
};

const verifyPayment = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { reference, order_id } = req.body;
        const customerId = req.user.id;

        if (!reference || !order_id) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_PARAMETERS',
                    message: 'Payment reference and order ID are required'
                }
            });
        }

        // Fetch the order
        const order = await Order.findByPk(order_id, {
            include: [{
                model: OrderItem,
                as: 'items'
            }]
        });

        if (!order) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        // Verify order belongs to customer
        if (order.customer_id !== customerId) {
            await t.rollback();
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this order'
                }
            });
        }

        // If already paid, return the order with full details
        if (order.payment_status === 'paid') {
            await t.commit();

            // Fetch order with product details for the receipt
            const orderWithDetails = await Order.findByPk(order_id, {
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product',
                        attributes: ['image_url'],
                        include: [{
                            model: require('../models').models.ProductImage,
                            as: 'images',
                            attributes: ['image_url', 'is_primary']
                        }]
                    }]
                }]
            });

            return res.json({
                success: true,
                data: orderWithDetails
            });
        }

        // Verify payment with Paystack
        const paymentVerification = await paystackService.verifyTransaction(reference);

        if (!paymentVerification || paymentVerification.status !== 'success') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PAYMENT_FAILED',
                    message: 'Payment verification failed'
                }
            });
        }

        // Update order status
        await order.update({
            payment_status: 'paid',
            order_status: 'processing'
        }, { transaction: t });

        // Add status history
        await OrderStatusHistory.create({
            order_id: order.id,
            old_status: 'pending',
            new_status: 'processing',
            notes: 'Payment verified and confirmed'
        }, { transaction: t });

        // Clear customer's cart after successful payment
        const cart = await Cart.findOne({ where: { customer_id: customerId } });
        if (cart) {
            await CartItem.destroy({
                where: { cart_id: cart.id }
            }, { transaction: t });
        }

        await t.commit();

        // Fetch updated order with items
        const updatedOrder = await Order.findByPk(order_id, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['image_url'],
                    include: [{
                        model: require('../models').models.ProductImage,
                        as: 'images',
                        attributes: ['image_url', 'is_primary']
                    }]
                }]
            }]
        });

        console.log('=== VERIFY PAYMENT - ORDER DATA ===');
        console.log('Order ID:', order_id);
        console.log('Has items?', !!updatedOrder.items);
        console.log('Items count:', updatedOrder.items?.length);
        if (updatedOrder.items && updatedOrder.items.length > 0) {
            console.log('First item has product?', !!updatedOrder.items[0].product);
            console.log('First item data:', JSON.stringify(updatedOrder.items[0], null, 2));
        }
        console.log('=== END ORDER DATA ===');

        res.json({
            success: true,
            data: updatedOrder
        });

        // Send confirmation email asynchronously
        try {
            await emailService.sendOrderConfirmation(updatedOrder);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        // Send Telegram notification to admin
        try {
            const telegramService = require('../services/telegramService');
            await telegramService.notifyNewPurchase(updatedOrder);
        } catch (telegramError) {
            console.error('Failed to send Telegram notification:', telegramError);
        }

        // Send email notification to admin
        try {
            const { ContactInfo } = require('../models').models;
            const contactInfo = await ContactInfo.findOne();
            const adminEmail = contactInfo?.email || process.env.ADMIN_EMAIL;

            if (adminEmail) {
                // Create a simple admin notification email
                const adminSubject = `🛒 New Order: ${updatedOrder.order_number}`;
                const adminHtml = `
                    <h2>New Order Received!</h2>
                    <p><strong>Order:</strong> ${updatedOrder.order_number}</p>
                    <p><strong>Customer:</strong> ${updatedOrder.customer_first_name} ${updatedOrder.customer_last_name}</p>
                    <p><strong>Email:</strong> ${updatedOrder.customer_email}</p>
                    <p><strong>Phone:</strong> ${updatedOrder.customer_phone}</p>
                    <p><strong>Total:</strong> ₦${parseFloat(updatedOrder.total_amount).toLocaleString()}</p>
                    <p><strong>Shipping:</strong> ${updatedOrder.shipping_city}, ${updatedOrder.shipping_state}</p>
                    <p>Check your admin dashboard to process this order.</p>
                `;

                const SibApiV3Sdk = require('sib-api-v3-sdk');
                const defaultClient = SibApiV3Sdk.ApiClient.instance;
                const apiKey = defaultClient.authentications['api-key'];
                apiKey.apiKey = process.env.BREVO_API_KEY;
                const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

                const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
                sendSmtpEmail.to = [{ email: adminEmail, name: 'Admin' }];
                sendSmtpEmail.sender = {
                    email: process.env.BREVO_SENDER_EMAIL || 'orders@nene.com',
                    name: process.env.BREVO_SENDER_NAME || 'Nene Yogurt'
                };
                sendSmtpEmail.subject = adminSubject;
                sendSmtpEmail.htmlContent = adminHtml;

                await apiInstance.sendTransacEmail(sendSmtpEmail);
                console.log('Admin order notification email sent');
            }
        } catch (adminEmailError) {
            console.error('Failed to send admin email notification:', adminEmailError);
        }

    } catch (error) {
        await t.rollback();
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error verifying payment'
            }
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const customerId = req.user.id;

        const order = await Order.findByPk(orderId, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['image_url'],
                    include: [{
                        model: require('../models').models.ProductImage,
                        as: 'images',
                        attributes: ['image_url', 'is_primary']
                    }]
                }]
            }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        // Verify order belongs to customer
        if (order.customer_id !== customerId) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'You do not have permission to access this order'
                }
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching order details'
            }
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
