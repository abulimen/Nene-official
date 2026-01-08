import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import { ArrowLeft, Package, Edit2, User, MapPin, CreditCard, Calendar, Phone, Mail, Truck, Clock } from 'lucide-react';
import OrderEditModal from '../../components/admin/OrderEditModal';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import { getUploadUrl } from '../../utils/config';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await adminService.getAdminOrder(id);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus, notes) => {
        await adminService.updateOrderStatus(id, newStatus, notes);
        fetchOrder();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-stone-100 text-stone-700 border-stone-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        return status === 'paid'
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-amber-100 text-amber-700 border-amber-200';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <Package size={48} className="mx-auto text-stone-300 mb-4" />
                <p className="text-stone-500">Order not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pb-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/orders')}
                className="flex items-center text-stone-500 hover:text-stone-900 mb-4 transition-colors text-sm"
            >
                <ArrowLeft size={18} className="mr-1" />
                Back to Orders
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 md:p-6 mb-4" data-tour="order-header">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-stone-900 mb-1">
                            {order.order_number}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-stone-500">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                        >
                            <Edit2 size={14} />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                            onClick={() => setIsStatusModalOpen(true)}
                            className={`px-3 py-2 rounded-xl text-sm font-semibold capitalize border ${getStatusColor(order.order_status)}`}
                        >
                            {order.order_status}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Order Items & History */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Order Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-tour="order-items">
                        <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                                <Package size={18} />
                                Order Items ({order.items?.length || 0})
                            </h2>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {order.items?.map((item) => (
                                <div key={item.id} className="p-4 flex items-start gap-3">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden">
                                        {item.product?.image_url ? (
                                            <img
                                                src={getUploadUrl(item.product.image_url)}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                                                <Package size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className="font-medium text-stone-900 text-sm md:text-base truncate">{item.product_name}</h3>
                                        {item.variation_name && (
                                            <p className="text-xs text-teal-600">Size: {item.variation_name}</p>
                                        )}
                                        <p className="text-xs text-stone-500">Qty: {item.quantity} × ₦{parseFloat(item.product_price).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-semibold text-stone-900 text-sm md:text-base">₦{parseFloat(item.subtotal).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-stone-50 p-4 space-y-2 text-sm">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal</span>
                                <span>₦{parseFloat(order.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                                <span>Shipping</span>
                                <span>₦{parseFloat(order.shipping_fee).toLocaleString()}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₦{parseFloat(order.discount_amount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base text-stone-900 pt-2 border-t border-stone-200">
                                <span>Total</span>
                                <span>₦{parseFloat(order.total_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order History/Timeline */}
                    {order.status_history && order.status_history.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
                            <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                                <Clock size={18} />
                                Order Timeline
                            </h2>
                            <div className="space-y-4">
                                {order.status_history.map((history, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-stone-900' : 'bg-stone-300'}`}></div>
                                            {index !== order.status_history.length - 1 && (
                                                <div className="w-0.5 flex-1 bg-stone-200 my-1"></div>
                                            )}
                                        </div>
                                        <div className="pb-4">
                                            <div className="font-medium text-stone-900 capitalize text-sm">{history.new_status}</div>
                                            {history.notes && <div className="text-xs text-stone-500">{history.notes}</div>}
                                            <div className="text-xs text-stone-400 mt-0.5">
                                                {new Date(history.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer & Shipping Info */}
                <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4" data-tour="customer-info">
                        <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                            <User size={18} />
                            Customer
                        </h2>
                        <div className="space-y-2">
                            <div className="font-medium text-stone-900">
                                {order.customer_first_name} {order.customer_last_name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                                <Mail size={14} className="text-stone-400" />
                                <a href={`mailto:${order.customer_email}`} className="hover:text-teal-600 break-all">
                                    {order.customer_email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                                <Phone size={14} className="text-stone-400" />
                                <a href={`tel:${order.customer_phone}`} className="hover:text-teal-600">
                                    {order.customer_phone}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4" data-tour="shipping-info">
                        <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                            <Truck size={18} />
                            Delivery Address
                        </h2>
                        <div className="text-sm text-stone-600 space-y-1">
                            <p>{order.shipping_address}</p>
                            <p className="font-medium text-stone-800">{order.shipping_city}, {order.shipping_state}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4" data-tour="payment-info">
                        <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                            <CreditCard size={18} />
                            Payment
                        </h2>
                        <div className="space-y-2">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${getPaymentStatusColor(order.payment_status)}`}>
                                {order.payment_status}
                            </span>
                            {order.payment_reference && (
                                <p className="text-xs text-stone-400 break-all">
                                    Ref: {order.payment_reference}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
                            <h2 className="font-semibold text-amber-800 mb-2 text-sm">Order Notes</h2>
                            <p className="text-sm text-amber-700">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && (
                <OrderEditModal
                    order={order}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={fetchOrder}
                />
            )}

            {isStatusModalOpen && (
                <StatusUpdateModal
                    order={order}
                    onClose={() => setIsStatusModalOpen(false)}
                    onUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
};

export default AdminOrderDetails;

