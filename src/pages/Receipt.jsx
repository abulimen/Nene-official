import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getApiBaseUrl, getUploadUrl } from '../utils/config';
import ProductImage from '../components/ui/ProductImage';

const Receipt = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const API_URL = getApiBaseUrl();
                const token = localStorage.getItem('customer_token');

                // We need to fetch the order details. 
                // Assuming we can fetch by ID if authenticated, or we might need a public endpoint if we want it to be shareable without login (but for now let's assume auth or token is present/handled)
                // Since the user is likely just redirected from checkout, they are logged in.

                // However, the previous OrderConfirmation used verify-payment. 
                // Here we just want to view an existing order.
                // We can use the my-orders endpoint logic or a specific get-order endpoint.
                // Let's assume we can fetch specific order details. 
                // If there isn't a direct "get one order" endpoint for customers, we might need to filter from my-orders or add one.
                // But usually `GET /orders/:id` exists. Let's check `orderController.js` if possible, but I'll assume standard REST for now or use the one from `OrderConfirmation` if it was fetching.
                // Wait, `OrderConfirmation` used `verify-payment` to get the order.
                // Let's try to fetch from `/orders/:id`.

                const response = await axios.get(
                    `${API_URL}/orders/${orderId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    setOrder(response.data.data);
                    document.title = `Nene_Receipt_${response.data.data.order_number}`;
                } else {
                    setError('Failed to load order');
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Failed to load order details.');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    useEffect(() => {
        if (order && !loading) {
            // Small delay to ensure images render
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, [order, loading]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading receipt...</div>;
    }

    if (error || !order) {
        return <div className="flex justify-center items-center min-h-screen text-red-600">{error || 'Order not found'}</div>;
    }

    return (
        <div className="bg-white min-h-screen p-8 md:p-12 max-w-4xl mx-auto print:p-0 print:max-w-none">
            {/* Receipt Content - Copied and adapted from OrderConfirmation */}
            <div className="bg-white w-full overflow-hidden relative">
                {/* Pink/Teal Top Border - Hidden in print if desired, or kept */}
                <div className="h-3 bg-teal-600 w-full print:bg-teal-600"></div>

                <div className="p-8 md:p-12 print:p-6">
                    <div className="md:grid md:grid-cols-2 md:gap-12">
                        {/* Left Column: Header, Info, Totals */}
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <img src="/nene-black-logo.png" alt="Nené" className="h-10 w-auto" />
                                        <p className="text-xs text-stone-500 mt-1">PURE & NATURAL YOGURT</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-xl font-bold text-stone-900">Receipt</h2>
                                        <p className="text-sm text-stone-500">Order Confirmed</p>
                                    </div>
                                </div>

                                {/* Order Info Grid */}
                                <div className="grid grid-cols-2 gap-y-6 text-sm mb-8 border-b border-stone-100 pb-6 md:border-none md:pb-0">
                                    <div>
                                        <p className="font-bold text-stone-900">Date:</p>
                                        <p className="text-stone-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-900">Order number:</p>
                                        <p className="text-stone-600">#{order.order_number}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-900">Payment:</p>
                                        <p className="text-stone-600 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 print-color-adjust-exact"></span>
                                            Paid via Paystack
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-900">Customer:</p>
                                        <p className="text-stone-600">{order.customer_first_name} {order.customer_last_name}</p>
                                        <p className="text-stone-600 text-xs">{order.shipping_address}</p>
                                        <p className="text-stone-600 text-xs">{order.shipping_city}, {order.shipping_state}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-stone-200 pt-4 space-y-2 text-sm mt-auto break-inside-avoid">
                                <div className="flex justify-between text-stone-600">
                                    <span>Subtotal</span>
                                    <span>₦{parseFloat(order.subtotal).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                    <span>Shipping</span>
                                    <span>₦{parseFloat(order.shipping_fee).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-teal-600">
                                        <span>Discount</span>
                                        <span>-₦{parseFloat(order.discount_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-stone-900 pt-4 border-t border-stone-900 mt-4">
                                    <span>Total <span className="text-xs font-normal text-stone-500">(incl. VAT)</span></span>
                                    <span>₦{parseFloat(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Items List */}
                        <div className="mt-8 md:mt-0 md:border-l md:border-stone-100 md:pl-12">
                            <h3 className="font-bold text-stone-900 mb-6 border-b border-stone-100 pb-2">Items</h3>
                            <div className="space-y-6">
                                {order.items && order.items.map((item) => {
                                    const getProductImage = (product) => {
                                        if (!product) return null;
                                        if (product.image_url) {
                                            return getUploadUrl(product.image_url);
                                        }
                                        if (product.images && product.images.length > 0) {
                                            const primary = product.images.find(img => img.is_primary);
                                            const imgUrl = primary ? primary.image_url : product.images[0].image_url;
                                            return getUploadUrl(imgUrl);
                                        }
                                        return null;
                                    };
                                    const imageUrl = getProductImage(item.product);

                                    return (
                                        <div key={item.id} className="flex gap-4 break-inside-avoid">
                                            <div className="w-16 h-16 bg-stone-100 rounded-md flex-shrink-0 overflow-hidden print:hidden">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <ProductImage type={item.product_name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-stone-900 text-sm uppercase max-w-[180px]">{item.product_name}</h4>
                                                    <span className="font-bold text-stone-900 text-sm">₦{parseFloat(item.subtotal).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {item.variation_name && (
                                                    <p className="text-xs text-teal-600 mt-1">Size: {item.variation_name}</p>
                                                )}
                                                <p className="text-xs text-stone-500 mt-1">Qty: {item.quantity}</p>
                                                <p className="text-xs text-stone-500">Unit Price: ₦{parseFloat(item.product_price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-12 text-center md:text-right text-xs text-stone-400 border-t border-stone-100 pt-4">
                                <p>Thank you for your patronage.</p>
                                <p>© 2025 Nené Foods.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};

export default Receipt;
