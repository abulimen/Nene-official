import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import { Package, ChevronRight, Calendar, MapPin, ShoppingBag, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useCustomerAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderService.getMyOrders();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-stone-100 text-stone-800 border-stone-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100 sticky top-28">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-stone-100">
                                <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xl border border-teal-100">
                                    {user?.first_name?.[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-stone-900 truncate">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <Link
                                    to="/account/orders"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-stone-900 text-white transition-colors"
                                >
                                    <ShoppingBag size={18} />
                                    My Orders
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Sign out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <h1 className="text-3xl font-serif font-bold text-stone-900">Order History</h1>
                            <p className="text-stone-500 mt-2">Track and manage your recent orders</p>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-16 text-center">
                                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="h-10 w-10 text-stone-400" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-3">No orders yet</h3>
                                <p className="text-stone-500 mb-8 max-w-md mx-auto">Looks like you haven't placed any orders yet. Start exploring our collection of premium dairy products.</p>
                                <Link
                                    to="/#shop"
                                    className="inline-flex items-center px-8 py-3 rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-100 hover:shadow-md transition-shadow duration-300">
                                        <div className="p-6 border-b border-stone-100 flex flex-wrap gap-4 justify-between items-center bg-stone-50/30">
                                            <div className="flex gap-4 items-center">
                                                <div className="h-12 w-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                                                    <Package className="h-6 w-6 text-teal-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-stone-900">Order #{order.order_number}</p>
                                                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.order_status)}`}>
                                                    {order.order_status}
                                                </span>
                                                <span className="font-bold text-lg text-stone-900">₦{parseFloat(order.total_amount).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="space-y-4 mb-6">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-dashed border-stone-100 last:border-0">
                                                        <div className="flex items-center gap-4">
                                                            <span className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">
                                                                x{item.quantity}
                                                            </span>
                                                            <span className="text-stone-900 font-medium">{item.product_name}</span>
                                                        </div>
                                                        <span className="text-stone-600 font-medium">₦{parseFloat(item.subtotal).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-start gap-3 pt-4 border-t border-stone-100 text-sm text-stone-600 bg-stone-50/50 -mx-6 -mb-6 p-6">
                                                <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-teal-600" />
                                                <div>
                                                    <p className="font-medium text-stone-900 mb-1">Shipping Address</p>
                                                    <p>{order.shipping_address}, {order.shipping_city}, {order.shipping_state}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
