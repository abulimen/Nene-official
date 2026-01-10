const { supabase } = require('../utils/supabase');
const emailService = require('../services/emailService');

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

        const offset = (page - 1) * parseInt(limit);

        // Start building query
        let query = supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `, { count: 'exact' });

        // Status filters
        if (status) query = query.eq('order_status', status);
        if (payment_status) query = query.eq('payment_status', payment_status);

        // Date range filter
        if (date_from) query = query.gte('created_at', new Date(date_from).toISOString());
        if (date_to) {
            const endDate = new Date(date_to);
            endDate.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDate.toISOString());
        }

        // Amount range filter
        if (amount_min) query = query.gte('total_amount', parseFloat(amount_min));
        if (amount_max) query = query.lte('total_amount', parseFloat(amount_max));

        // Text search
        if (search) {
            query = query.or(`order_number.ilike.%${search}%,customer_first_name.ilike.%${search}%,customer_last_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
        }

        // Sorting
        const allowedSortColumns = ['created_at', 'total_amount', 'order_status', 'order_number'];
        const sortColumn = allowedSortColumns.includes(sort_by) ? sort_by : 'created_at';
        const ascending = sort_order.toUpperCase() === 'ASC';

        const { data: orders, count, error } = await query
            .order(sortColumn, { ascending })
            .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;

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
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*),
                statusHistory:order_status_history(
                    *,
                    admin:admin_users(id, full_name)
                )
            `)
            .eq('id', req.params.id)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }
        if (error) throw error;

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
    try {
        const { status, notes } = req.body;

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !order) {
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
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_CHANGE',
                    message: 'New status is same as current status'
                }
            });
        }

        // Update order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({ order_status: status })
            .eq('id', order.id);

        if (updateError) throw updateError;

        // Create status history
        await supabase.from('order_status_history').insert({
            order_id: order.id,
            old_status: oldStatus,
            new_status: status,
            changed_by: req.user.id,
            notes: notes || `Status updated to ${status}`
        });

        // Send email notification
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
    try {
        const { shipping_address, shipping_city, shipping_state, items } = req.body;

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Order not found'
                }
            });
        }

        // Update shipping details
        await supabase
            .from('orders')
            .update({
                shipping_address,
                shipping_city,
                shipping_state
            })
            .eq('id', order.id);

        // Update items if provided
        if (items && items.length > 0) {
            // Delete existing items
            await supabase
                .from('order_items')
                .delete()
                .eq('order_id', order.id);

            // Create new items
            let subtotal = 0;
            for (const item of items) {
                const { data: product } = await supabase
                    .from('products')
                    .select('name')
                    .eq('id', item.product_id)
                    .single();

                if (!product) throw new Error(`Product ${item.product_id} not found`);

                const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
                subtotal += itemSubtotal;

                await supabase.from('order_items').insert({
                    order_id: order.id,
                    product_id: item.product_id,
                    product_name: product.name,
                    product_price: item.price,
                    quantity: item.quantity,
                    subtotal: itemSubtotal
                });
            }

            // Update order totals
            const total_amount = subtotal + parseFloat(order.shipping_fee) - parseFloat(order.discount_amount || 0);
            await supabase
                .from('orders')
                .update({ subtotal, total_amount })
                .eq('id', order.id);
        }

        // Fetch updated order
        const { data: updatedOrder } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('id', order.id)
            .single();

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });

    } catch (error) {
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
