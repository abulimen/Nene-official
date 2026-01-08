import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useCustomerAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getMyOrders();
            setOrders(response.data.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetryPayment = async (orderId) => {
        try {
            const response = await orderService.retryPayment(orderId);
            if (response.data.data.payment_url) {
                window.location.href = response.data.data.payment_url;
            }
        } catch (err) {
            console.error('Error retrying payment:', err);
            alert(err.response?.data?.error?.message || 'Failed to retry payment. Please try again.');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await orderService.cancelOrder(orderId);
            alert('Order cancelled successfully');
            fetchOrders(); // Refresh orders list
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert(err.response?.data?.error?.message || 'Failed to cancel order. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-orange-100 text-orange-800',
            paid: 'bg-teal-100 text-teal-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return `₦${parseFloat(price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchOrders}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const unpaidOrders = orders.filter(order => order.payment_status === 'pending' && order.order_status !== 'cancelled');
    const paidOrders = orders.filter(order => order.payment_status === 'paid' || order.order_status === 'cancelled');

    return (
        <div className="min-h-screen bg-stone-50 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-stone-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-stone-900 mb-2">No orders yet</h3>
                        <p className="text-stone-600 mb-6">Start shopping to see your orders here</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Unpaid Orders Section */}
                        {unpaidOrders.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
                                    <span className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full mr-3">
                                        {unpaidOrders.length}
                                    </span>
                                    Pending Payment
                                </h2>
                                <div className="space-y-4">
                                    {unpaidOrders.map(order => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            formatDate={formatDate}
                                            formatPrice={formatPrice}
                                            getStatusColor={getStatusColor}
                                            getPaymentStatusColor={getPaymentStatusColor}
                                            onRetryPayment={handleRetryPayment}
                                            onCancelOrder={handleCancelOrder}
                                            showActions={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order History Section */}
                        {paidOrders.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900 mb-4">Order History</h2>
                                <div className="space-y-4">
                                    {paidOrders.map(order => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            formatDate={formatDate}
                                            formatPrice={formatPrice}
                                            getStatusColor={getStatusColor}
                                            getPaymentStatusColor={getPaymentStatusColor}
                                            showActions={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const OrderCard = ({ order, formatDate, formatPrice, getStatusColor, getPaymentStatusColor, onRetryPayment, onCancelOrder, showActions }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div className="mb-3 md:mb-0">
                    <h3 className="text-lg font-bold text-stone-900">Order #{order.order_number}</h3>
                    <p className="text-sm text-stone-600">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                        {order.order_status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="border-t border-stone-200 pt-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-stone-600">Customer</p>
                        <p className="font-semibold text-stone-900">{order.customer_first_name} {order.customer_last_name}</p>
                        <p className="text-stone-600">{order.customer_email}</p>
                    </div>
                    <div>
                        <p className="text-stone-600">Shipping Address</p>
                        <p className="font-semibold text-stone-900">{order.shipping_address}</p>
                        <p className="text-stone-600">{order.shipping_city}, {order.shipping_state}</p>
                    </div>
                </div>
            </div>

            {order.items && order.items.length > 0 && (
                <div className="border-t border-stone-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-stone-900 mb-2">Order Items</p>
                    <div className="space-y-2">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-stone-700">{item.product_name} × {item.quantity}</span>
                                <span className="font-semibold text-stone-900">{formatPrice(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-stone-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-stone-900">Total</span>
                    <span className="text-2xl font-bold text-teal-700">{formatPrice(order.total_amount)}</span>
                </div>
            </div>

            {showActions && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => onRetryPayment(order.id)}
                        className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                    >
                        Pay Now
                    </button>
                    <button
                        onClick={() => onCancelOrder(order.id)}
                        className="flex-1 bg-white border-2 border-red-600 text-red-600 py-3 px-6 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                    >
                        Cancel Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
