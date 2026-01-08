const { Order, OrderItem, OrderStatusHistory, AdminUser } = require('../models').models;
const { Op } = require('sequelize');
const emailService = require('../services/emailService');
const { sequelize } = require('../utils/db');

const getOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            payment_status,
            search,
            date_from,
            date_to,
            amount_min,
            amount_max,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        // Build where clause
        const where = {};

        // Status filter
        if (status) {
            where.order_status = status;
        }

        // Payment status filter
        if (payment_status) {
            where.payment_status = payment_status;
        }

        // Date range filter
        if (date_from || date_to) {
            where.created_at = {};
            if (date_from) {
                where.created_at[Op.gte] = new Date(date_from);
            }
            if (date_to) {
                // Add 23:59:59 to include the entire day
                const endDate = new Date(date_to);
                endDate.setHours(23, 59, 59, 999);
                where.created_at[Op.lte] = endDate;
            }
        }

        // Amount range filter
        if (amount_min || amount_max) {
            where.total_amount = {};
            if (amount_min) {
                where.total_amount[Op.gte] = parseFloat(amount_min);
            }
            if (amount_max) {
                where.total_amount[Op.lte] = parseFloat(amount_max);
            }
        }

        // Text search across order_number, customer name, and email
        if (search) {
            where[Op.or] = [
                { order_number: { [Op.like]: `%${search}%` } },
                { customer_first_name: { [Op.like]: `%${search}%` } },
                { customer_last_name: { [Op.like]: `%${search}%` } },
                { customer_email: { [Op.like]: `%${search}%` } }
            ];
        }

        // Validate sort_by column
        const allowedSortColumns = ['created_at', 'total_amount', 'order_status', 'order_number'];
        const sortColumn = allowedSortColumns.includes(sort_by) ? sort_by : 'created_at';
        const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const offset = (page - 1) * limit;

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortColumn, sortDirection]],
            include: [{
                model: OrderItem,
                as: 'items'
            }]
        });

        res.json({
            success: true,
            data: {
                orders,
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching orders'
            }
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items' },
                {
                    model: OrderStatusHistory,
                    as: 'statusHistory',
                    include: [{ model: AdminUser, as: 'admin', attributes: ['id', 'full_name'] }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching order'
            }
        });
    }
};

const updateOrderStatus = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { status, notes } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        const oldStatus = order.order_status;

        if (oldStatus === status) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_CHANGE',
                    message: 'New status is same as current status'
                }
            });
        }

        await order.update({ order_status: status }, { transaction: t });

        await OrderStatusHistory.create({
            order_id: order.id,
            old_status: oldStatus,
            new_status: status,
            changed_by: req.user.id,
            notes: notes || `Status updated to ${status} `
        }, { transaction: t });

        await t.commit();

        // Send email notifications based on status change
        // Send email notifications based on status change
        await emailService.sendOrderStatusUpdate(order, status);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                order_id: order.id,
                old_status: oldStatus,
                new_status: status
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating order status'
            }
        });
    }
};

const updateOrder = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { shipping_address, shipping_city, shipping_state, items } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        // Update shipping details
        await order.update({
            shipping_address,
            shipping_city,
            shipping_state
        }, { transaction: t });

        // Update items if provided
        if (items && items.length > 0) {
            // Delete existing items
            await OrderItem.destroy({
                where: { order_id: order.id },
                transaction: t
            });

            // Create new items
            let subtotal = 0;
            for (const item of items) {
                const product = await require('../models').models.Product.findByPk(item.product_id);
                if (!product) throw new Error(`Product ${item.product_id} not found`);

                const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
                subtotal += itemSubtotal;

                await OrderItem.create({
                    order_id: order.id,
                    product_id: item.product_id,
                    product_name: product.name,
                    product_price: item.price,
                    quantity: item.quantity,
                    subtotal: itemSubtotal
                }, { transaction: t });
            }

            // Update order totals
            const total_amount = subtotal + parseFloat(order.shipping_fee) - parseFloat(order.discount_amount || 0);
            await order.update({
                subtotal,
                total_amount
            }, { transaction: t });
        }

        await t.commit();

        // Fetch updated order
        const updatedOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        await t.rollback();
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating order'
            }
        });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    updateOrderStatus,
    updateOrder
};
