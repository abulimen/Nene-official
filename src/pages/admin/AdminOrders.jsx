import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { Eye, Filter, Search, X, Calendar, DollarSign, SlidersHorizontal } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        payment_status: '',
        date_from: '',
        date_to: '',
        amount_min: '',
        amount_max: '',
        sort_by: 'created_at',
        sort_order: 'DESC'
    });

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounced search
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput }));
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchOrders();
    }, [page, filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10, ...filters };

            // Remove empty filter values
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await adminService.getOrders(params);
            setOrders(response.data.data.orders);
            setTotalPages(response.data.data.pages);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: '',
            payment_status: '',
            date_from: '',
            date_to: '',
            amount_min: '',
            amount_max: '',
            sort_by: 'created_at',
            sort_order: 'DESC'
        });
        setSearchInput('');
        setPage(1);
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.payment_status) count++;
        if (filters.date_from || filters.date_to) count++;
        if (filters.amount_min || filters.amount_max) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            case 'processing': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-stone-100 text-stone-700';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6" data-tour="orders-header">
                <h1 className="text-3xl font-serif font-bold text-stone-900">Orders</h1>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                        <X size={16} />
                        Clear {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Search and Basic Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6" data-tour="orders-filters">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Search Input */}
                    <div className="relative lg:col-span-2">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search order number, customer name, or email..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none bg-white"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all ${showAdvancedFilters
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                    >
                        <SlidersHorizontal size={18} />
                        Advanced
                    </button>
                </div>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
                        {/* Payment Status */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-stone-600 mb-1">Payment Status</label>
                            <select
                                value={filters.payment_status}
                                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none bg-white"
                            >
                                <option value="">All Payments</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-stone-600 mb-1">Date From</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                />
                            </div>
                        </div>

                        {/* Date To */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-stone-600 mb-1">Date To</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                />
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-stone-600 mb-1">Sort By</label>
                            <select
                                value={`${filters.sort_by}-${filters.sort_order}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] = e.target.value.split('-');
                                    setFilters(prev => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }));
                                }}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none bg-white"
                            >
                                <option value="created_at-DESC">Newest First</option>
                                <option value="created_at-ASC">Oldest First</option>
                                <option value="total_amount-DESC">Highest Amount</option>
                                <option value="total_amount-ASC">Lowest Amount</option>
                            </select>
                        </div>

                        {/* Amount Min */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-stone-600 mb-1">Min Amount (₦)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.amount_min}
                                    onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                />
                            </div>
                        </div>

                        {/* Amount Max */}
                        <div className="relative lg:col-span-3">
                            <label className="block text-xs font-medium text-stone-600 mb-1">Max Amount (₦)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="number"
                                    placeholder="No limit"
                                    value={filters.amount_max}
                                    onChange={(e) => handleFilterChange('amount_max', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-tour="orders-table">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-stone-50">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-stone-500 font-medium">Order ID</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Customer</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Date</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Total</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Status</th>
                                <th className="px-6 py-4 text-stone-500 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-stone-500">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-stone-500">No orders found</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-stone-900">{order.order_number}</td>
                                        <td className="px-6 py-4 text-stone-600">
                                            <div>{order.customer_first_name} {order.customer_last_name}</div>
                                            <div className="text-xs text-stone-400">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-stone-900">₦{parseFloat(order.total_amount).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="inline-flex p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-stone-200 disabled:opacity-50 hover:bg-stone-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-stone-600">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg border border-stone-200 disabled:opacity-50 hover:bg-stone-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
