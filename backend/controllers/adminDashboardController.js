const { supabase } = require('../utils/supabase');

const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (excluding cancelled orders)
        const { data: revenueData } = await supabase
            .from('orders')
            .select('total_amount')
            .neq('order_status', 'cancelled');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

        // 2. Order Counts by Status
        const { data: allOrders } = await supabase
            .from('orders')
            .select('order_status');

        const orderStats = {
            total: 0,
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        allOrders?.forEach(order => {
            orderStats[order.order_status] = (orderStats[order.order_status] || 0) + 1;
            orderStats.total++;
        });

        // 3. Product Stats
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        const { count: activeProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        const { count: outOfStockProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .eq('is_available', false);

        // 4. Customer Stats
        const { count: totalCustomers } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        // 5. Sales Chart Data (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentOrders } = await supabase
            .from('orders')
            .select('created_at, total_amount, id')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .neq('order_status', 'cancelled')
            .order('created_at', { ascending: true });

        // Group by date for chart
        const salesByDate = {};
        recentOrders?.forEach(order => {
            const date = order.created_at.split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = { date, revenue: 0, orders: 0 };
            }
            salesByDate[date].revenue += parseFloat(order.total_amount || 0);
            salesByDate[date].orders++;
        });
        const salesChart = Object.values(salesByDate);

        // 6. Top Selling Products
        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
                product_id,
                product_name,
                quantity,
                subtotal,
                order:orders!inner(order_status)
            `)
            .neq('order.order_status', 'cancelled');

        const productSales = {};
        orderItems?.forEach(item => {
            const key = item.product_id || item.product_name;
            if (!productSales[key]) {
                productSales[key] = {
                    product_id: item.product_id,
                    product_name: item.product_name,
                    total_sold: 0,
                    total_revenue: 0
                };
            }
            productSales[key].total_sold += item.quantity;
            productSales[key].total_revenue += parseFloat(item.subtotal || 0);
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.total_sold - a.total_sold)
            .slice(0, 5);

        // 7. Recent Orders
        const { data: recent5Orders } = await supabase
            .from('orders')
            .select('id, order_number, customer_first_name, customer_last_name, total_amount, order_status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            success: true,
            data: {
                revenue: totalRevenue,
                orders: orderStats,
                products: {
                    total: totalProducts || 0,
                    active: activeProducts || 0,
                    outOfStock: outOfStockProducts || 0
                },
                customers: totalCustomers || 0,
                salesChart,
                topProducts,
                recentOrders: recent5Orders || []
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
