import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, Calendar, Download, ArrowRight, XCircle } from 'lucide-react';
import axios from 'axios';
import { getApiBaseUrl, getUploadUrl } from '../../utils/config';
import { useCart } from '../../context/CartContext';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import ProductImage from '../ui/ProductImage';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const receiptRef = useRef(null);

    useEffect(() => {
        const verifyPaymentAndFetchOrder = async () => {
            try {
                // Get order_id and reference from URL params
                const params = new URLSearchParams(location.search);
                const orderId = params.get('order_id');
                const reference = params.get('reference') || params.get('trxref');

                if (!orderId || !reference) {
                    setError('Missing order or payment information');
                    setLoading(false);
                    return;
                }

                // Verify payment with backend
                const API_URL = getApiBaseUrl();
                const token = localStorage.getItem('customer_token');

                const verifyResponse = await axios.post(
                    `${API_URL}/orders/verify-payment`,
                    { reference, order_id: orderId },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (verifyResponse.data.success) {
                    setOrder(verifyResponse.data.data);
                    // Clear cart after successful payment
                    await clearCart();
                } else {
                    setError(verifyResponse.data.error?.message || 'Payment verification failed');
                }
            } catch (err) {
                console.error('Payment verification error:', err);
                setError(err.response?.data?.error?.message || 'Failed to verify payment. Please contact support.');
            } finally {
                setLoading(false);
            }
        };

        verifyPaymentAndFetchOrder();
    }, [location.search]);

    const handleDownloadReceipt = async () => {
        if (!receiptRef.current) return;

        try {
            const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProperties = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Nene_Receipt_${order.order_number}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to download receipt. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-stone-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={32} className="text-red-600" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">Payment Verification Failed</h1>
                    <p className="text-stone-600 mb-8">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/my-orders" className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors">
                            View My Orders
                        </Link>
                        <Link to="/" className="bg-stone-200 text-stone-900 px-6 py-3 rounded-xl hover:bg-stone-300 transition-colors">
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-serif font-bold text-stone-900 mb-4">Order Not Found</h1>
                    <p className="text-stone-600 mb-8">We couldn't find the order details you're looking for.</p>
                    <Link to="/" className="bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-stone-800 transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 pt-32 pb-12 px-4 flex flex-col items-center justify-center">

            {/* Receipt Container */}
            <div ref={receiptRef} className="bg-white w-full max-w-md md:max-w-4xl shadow-lg rounded-sm overflow-hidden relative transition-all duration-300">
                {/* Pink/Teal Top Border */}
                <div className="h-3 bg-teal-600 w-full"></div>

                <div className="p-8 md:p-12">
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
                                    <div className="text-right md:hidden">
                                        <h2 className="text-xl font-bold text-stone-900">Thank you!</h2>
                                        <p className="text-sm text-stone-500">Your order is confirmed.</p>
                                    </div>
                                </div>

                                {/* Desktop Thank You (Visible only on md+) */}
                                <div className="hidden md:block mb-8">
                                    <h2 className="text-2xl font-bold text-stone-900">Thank you!</h2>
                                    <p className="text-stone-500">Your order is confirmed.</p>
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
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Paid via Paystack
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-stone-900">Delivery info:</p>
                                        <p className="text-stone-600">{order.customer_first_name} {order.customer_last_name}</p>
                                        <p className="text-stone-600 text-xs">{order.shipping_address}</p>
                                        <p className="text-stone-600 text-xs">{order.shipping_city}, {order.shipping_state}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Totals (Moved here for desktop layout) */}
                            <div className="border-t border-stone-200 pt-4 space-y-2 text-sm mt-auto">
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
                            <h3 className="font-bold text-stone-900 mb-6 border-b border-stone-100 pb-2">Description</h3>
                            <div className="space-y-6">
                                {order.items && order.items.map((item) => {
                                    const getProductImage = (product) => {
                                        if (!product) return null;

                                        // Use product.image_url first
                                        if (product.image_url) {
                                            return getUploadUrl(product.image_url);
                                        }

                                        // Fallback to images array
                                        if (product.images && product.images.length > 0) {
                                            const primary = product.images.find(img => img.is_primary);
                                            const imgUrl = primary ? primary.image_url : product.images[0].image_url;
                                            return getUploadUrl(imgUrl);
                                        }

                                        return null;
                                    };
                                    const imageUrl = getProductImage(item.product);

                                    return (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-16 h-16 bg-stone-100 rounded-md flex-shrink-0 overflow-hidden">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="w-full h-full bg-stone-200 flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
                                                    <ProductImage type={item.product_name} className="w-full h-full object-cover" />
                                                </div>
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
                                                <p className="text-xs text-stone-500">Price: ₦{parseFloat(item.product_price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer Message (Moved to bottom of right column on desktop) */}
                            <div className="mt-12 text-center md:text-right text-xs text-stone-400 border-t border-stone-100 pt-4">
                                <p>This email confirms payment for the products listed above.</p>
                                <p>© 2025 Nené Foods. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-4xl">
                <button
                    onClick={() => window.open(`/receipt/${order.id}`, '_blank')}
                    className="flex-1 bg-stone-900 text-white py-4 px-6 rounded-none font-bold text-sm uppercase tracking-wider hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    Print Receipt
                </button>
                <Link
                    to="/my-orders"
                    className="flex-1 bg-teal-600 text-white py-4 px-6 rounded-none font-bold text-sm uppercase tracking-wider hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                    Track your order
                    <ArrowRight size={18} />
                </Link>
            </div>

            <Link to="/" className="mt-6 text-sm text-stone-500 underline hover:text-stone-900">
                Return to Shop
            </Link>
        </div>
    );
};

export default OrderConfirmation;
