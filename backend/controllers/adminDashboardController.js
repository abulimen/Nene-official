const { models, sequelize } = require('../models');
const { Order, OrderItem, Product, Customer } = models;
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (excluding cancelled orders)
        const revenueResult = await Order.sum('total_amount', {
            where: {
                order_status: { [Op.ne]: 'cancelled' }
            }
        });
        const totalRevenue = revenueResult || 0;

        // 2. Order Counts by Status
        const orderCounts = await Order.findAll({
            attributes: ['order_status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['order_status']
        });

        const orderStats = {
            total: 0,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orderCounts.forEach(stat => {
            const status = stat.order_status;
            const count = parseInt(stat.get('count'));
            orderStats[status] = count;
            orderStats.total += count;
        });

        // 3. Product Stats
        const totalProducts = await Product.count();
        const activeProducts = await Product.scope('active').count();
        const outOfStockProducts = await Product.scope('active').count({
            where: { is_available: false }
        });

        // 4. Customer Stats
        const totalCustomers = await Customer.count();

        // 5. Sales Chart Data (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesData = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orders']
            ],
            where: {
                created_at: { [Op.gte]: thirtyDaysAgo },
                order_status: { [Op.ne]: 'cancelled' }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
        });

        // 6. Top Selling Products
        const topProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                'product_name',
                [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'total_sold'],
                [sequelize.fn('SUM', sequelize.col('OrderItem.subtotal')), 'total_revenue']
            ],
            include: [{
                model: Order,
                attributes: [],
                where: { order_status: { [Op.ne]: 'cancelled' } }
            }],
            group: ['product_id', 'product_name'],
            order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
            limit: 5
        });

        // 7. Recent Orders
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'order_number', 'customer_first_name', 'customer_last_name', 'total_amount', 'order_status', 'created_at']
        });

        res.json({
            success: true,
            data: {
                revenue: totalRevenue,
                orders: orderStats,
                products: {
                    total: totalProducts,
                    active: activeProducts,
                    outOfStock: outOfStockProducts
                },
                customers: totalCustomers,
                salesChart: salesData,
                topProducts,
                recentOrders
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching dashboard statistics'
            }
        });
    }
};

module.exports = {
    getDashboardStats
};
