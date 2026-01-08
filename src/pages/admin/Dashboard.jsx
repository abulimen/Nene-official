import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import {
    DollarSign, ShoppingBag, Users, Package, TrendingUp,
    ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await adminService.getDashboardStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
            </div>
        );
    }

    if (!stats) return null;

    // Data for Pie Chart
    const orderStatusData = [
        { name: 'Pending', value: stats.orders.pending, color: '#f59e0b' },
        { name: 'Processing', value: stats.orders.processing, color: '#3b82f6' },
        { name: 'Shipped', value: stats.orders.shipped, color: '#8b5cf6' },
        { name: 'Delivered', value: stats.orders.delivered, color: '#10b981' },
        { name: 'Cancelled', value: stats.orders.cancelled, color: '#ef4444' }
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900">Dashboard</h1>
                    <p className="text-stone-500 mt-1">Overview of your business performance</p>
                </div>
                <div className="text-sm text-stone-500 bg-stone-100 px-4 py-2 rounded-full">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₦${stats.revenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-emerald-50 text-emerald-600"
                    subtitle="Excluding cancelled orders"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders.total}
                    icon={ShoppingBag}
                    color="bg-blue-50 text-blue-600"
                    subtitle={`${stats.orders.delivered} delivered`}
                />
                <StatCard
                    title="Active Customers"
                    value={stats.customers}
                    icon={Users}
                    color="bg-purple-50 text-purple-600"
                    subtitle="Registered accounts"
                />
                <StatCard
                    title="Active Products"
                    value={stats.products.active}
                    icon={Package}
                    subtitle={`${stats.products.outOfStock} out of stock`}
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Area Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="text-lg font-bold text-stone-900 mb-6">Revenue Trend (30 Days)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.salesChart}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    stroke="#a8a29e"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#a8a29e"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₦${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0d9488"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <h3 className="text-lg font-bold text-stone-900 mb-6">Order Status</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Top Products & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-6 border-b border-stone-100">
                        <h3 className="text-lg font-bold text-stone-900">Top Selling Products</h3>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {stats.topProducts.map((product, index) => (
                            <div key={product.product_id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500 text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-stone-900">{product.product_name}</p>
                                        <p className="text-xs text-stone-500">{product.total_sold} units sold</p>
                                    </div>
                                </div>
                                <span className="font-bold text-stone-900">₦{parseInt(product.total_revenue).toLocaleString()}</span>
                            </div>
                        ))}
                        {stats.topProducts.length === 0 && (
                            <div className="p-8 text-center text-stone-500">No sales data yet</div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-stone-900">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {stats.recentOrders.map((order) => (
                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-stone-900">{order.order_number}</span>
                                        <StatusBadge status={order.order_status} />
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        {order.customer_first_name} {order.customer_last_name} • {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="font-bold text-stone-900">₦{parseFloat(order.total_amount).toLocaleString()}</span>
                            </div>
                        ))}
                        {stats.recentOrders.length === 0 && (
                            <div className="p-8 text-center text-stone-500">No orders yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, subtitle, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} />
            </div>
        </div>
        <div>
            <p className="text-stone-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-stone-900">{value}</h3>
            {subtitle && <p className="text-xs text-stone-400 mt-1">{subtitle}</p>}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-amber-100 text-amber-700',
        processing: 'bg-blue-100 text-blue-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };

    return (
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${styles[status] || 'bg-stone-100 text-stone-700'}`}>
            {status}
        </span>
    );
};

export default Dashboard;
