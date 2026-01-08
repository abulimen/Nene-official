import { ArrowLeft, MapPin, CreditCard, Minus, Plus, X, Check } from 'lucide-react';
import LockIcon from '../ui/LockIcon';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { settingsService, discountService, orderService } from '../../services/api';
import { usePaystackPayment } from 'react-paystack';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { getUploadUrl } from '../../utils/config';
import ProductImage from '../ui/ProductImage';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, loading: authLoading } = useCustomerAuth();
    const { cartItems, cartTotal, updateQuantity, removeFromCart, syncCartWithDatabase } = useCart();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    });
    const [shippingStates, setShippingStates] = useState([]);
    const [shippingFee, setShippingFee] = useState(0);
    const [discountCode, setDiscountCode] = useState('');
    const [discount, setDiscount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validatingCode, setValidatingCode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // 1: Information, 2: Payment, 3: Complete

    // Ref to prevent duplicate order submissions
    const isSubmittingRef = React.useRef(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { from: location } });
        }
    }, [isAuthenticated, authLoading, navigate, location]);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        fetchShippingStates();
        // Sync cart items with latest product data
        syncCartWithDatabase();
    }, []);

    const fetchShippingStates = async () => {
        try {
            const response = await settingsService.getShippingStates();
            setShippingStates(response.data.data);
        } catch (error) {
            console.error('Error fetching shipping states:', error);
        }
    };

    const handleStateChange = (e) => {
        const stateName = e.target.value;
        setFormData({ ...formData, state: stateName });
        const selectedState = shippingStates.find(s => s.state_name === stateName);
        setShippingFee(selectedState ? parseFloat(selectedState.shipping_fee) : 0);
    };

    const handleApplyDiscount = async () => {
        if (!discountCode) return;
        setValidatingCode(true);
        try {
            const response = await discountService.validateDiscount({
                code: discountCode,
                order_amount: cartTotal
            });
            setDiscount(response.data.data);
        } catch (error) {
            console.error('Discount error:', error);
            alert(error.response?.data?.error?.message || 'Invalid discount code');
            setDiscount(null);
        } finally {
            setValidatingCode(false);
        }
    };

    const calculateTotal = () => {
        let finalTotal = cartTotal + shippingFee;
        if (discount) {
            if (discount.type === 'percentage') {
                finalTotal -= (cartTotal * discount.value / 100);
            } else {
                finalTotal -= discount.value;
            }
        }
        return Math.max(0, finalTotal);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (isSubmittingRef.current) {
            console.log('Order submission already in progress, ignoring duplicate click');
            return;
        }

        isSubmittingRef.current = true;
        setLoading(true);

        // Validate cart items before creating order
        const isValid = await validateCartItems();
        if (!isValid) {
            setLoading(false);
            isSubmittingRef.current = false;
            return;
        }

        try {
            const orderData = {
                customer_first_name: formData.firstName,
                customer_last_name: formData.lastName,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: formData.address,
                shipping_city: formData.city,
                shipping_state: formData.state,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    variation_id: item.selectedVariation?.id || null,
                    variation_name: item.selectedVariation?.name || item.displaySize || item.size
                })),
                discount_code: discount?.code
            };

            const response = await orderService.createOrder(orderData);

            if (response.data.data.payment_url) {
                // Redirect to payment - don't reset isSubmittingRef since we're leaving the page
                window.location.href = response.data.data.payment_url;
            } else {
                alert('Order created but payment initialization failed');
                isSubmittingRef.current = false;
            }

        } catch (error) {
            console.error('Order creation error:', error);
            alert('Failed to create order. Please try again.');
            isSubmittingRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    const validateCartItems = async () => {
        // Fetch fresh product data to check availability
        try {
            const { productService } = await import('../../services/api');
            for (const item of cartItems) {
                const response = await productService.getById(item.id);
                const product = response.data.data;

                if (!product.is_active) {
                    throw new Error(`Product "${item.name}" has been removed and is no longer available.`);
                }

                if (!product.is_available) {
                    throw new Error(`Product "${item.name}" is currently out of stock.`);
                }
            }
            return true;
        } catch (error) {
            alert(error.message || 'Some items in your cart are no longer available. Please review your cart.');
            return false;
        }
    };

    // Check for unavailable items
    const hasUnavailableItems = cartItems.some(item => !item.is_active || !item.is_available);
    const unavailableCount = cartItems.filter(item => !item.is_active || !item.is_available).length;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-greek-cream pt-20 md:pt-28">
            <div className="max-w-[1600px] mx-auto bg-white min-h-screen shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">

                    {/* LEFT COLUMN - Information Form */}
                    <div className="lg:col-span-7 p-6 md:p-8 lg:p-16 flex flex-col">
                        <div className="mb-10">
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-serif font-bold text-nene-black mb-2">Checkout</h1>
                                <p className="text-stone-500">Complete your order securely</p>
                            </div>

                            {/* Steps Indicator */}
                            <div className="flex items-center gap-2 md:gap-4 mb-8 md:mb-12 text-xs md:text-sm font-medium">
                                <div className="flex items-center gap-1 md:gap-2 text-teal-700">
                                    <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-teal-700 text-white text-xs">1</span>
                                    <span className="hidden sm:inline">Information</span>
                                </div>
                                <div className="h-[1px] w-6 md:w-12 bg-stone-200"></div>
                                <div className="flex items-center gap-1 md:gap-2 text-stone-400">
                                    <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-stone-100 text-stone-400 text-xs">2</span>
                                    <span className="hidden sm:inline">Payment</span>
                                </div>
                                <div className="h-[1px] w-6 md:w-12 bg-stone-200"></div>
                                <div className="flex items-center gap-1 md:gap-2 text-stone-400">
                                    <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-stone-100 text-stone-400 text-xs">3</span>
                                    <span className="hidden sm:inline">Complete</span>
                                </div>
                            </div>

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-8">
                                {/* Name Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-900">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter First Name"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-900">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter Last Name"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-900">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter Email Address"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-900">Phone No</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Enter Phone Number"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-900">Delivery Address</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter Delivery Address"
                                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-900">City</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter City"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-900">State</label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50 appearance-none"
                                                value={formData.state}
                                                onChange={handleStateChange}
                                            >
                                                <option value="">Select State</option>
                                                {shippingStates.map(s => (
                                                    <option key={s.id} value={s.state_name}>{s.state_name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-stone-900">Postal Code</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Postal Code"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50"
                                            value={formData.zip}
                                            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-stone-900">Note (Optional)</label>
                                    <textarea
                                        placeholder="Enter Note"
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-stone-50 resize-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>
                            </form>

                            <div className="mt-8 md:mt-12">
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={loading || hasUnavailableItems}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${hasUnavailableItems
                                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                        : loading
                                            ? 'bg-stone-700 text-white cursor-wait'
                                            : 'bg-nene-black text-white hover:bg-stone-800'
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {loading ? 'Processing...' : 'Proceed to Payment'}
                                        {!loading && (
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Cart Summary */}
                    <div className="lg:col-span-5 bg-nene-black p-4 md:p-8 lg:p-16 text-white flex flex-col min-h-[400px] lg:h-full">
                        <h2 className="text-2xl font-serif font-bold mb-8 text-white">Your Cart</h2>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 pr-2 mb-6 md:mb-8 max-h-[300px] lg:max-h-none custom-scrollbar">
                            {cartItems.map((item) => {
                                const isUnavailable = !item.is_active || !item.is_available;
                                // Generate unique key for cart item (handles variations)
                                const cartKey = item.cartKey || (item.selectedVariation
                                    ? `${item.id}_${item.selectedVariation.id}`
                                    : item.id);
                                return (
                                    <div key={cartKey} className={`relative flex gap-3 md:gap-4 p-3 md:p-4 rounded-xl items-center ${isUnavailable ? 'border border-amber-300 bg-amber-50/30' : 'bg-stone-800/50 border border-stone-700/50'
                                        }`}>
                                        {isUnavailable && (
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                    {!item.is_active ? 'Deleted' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg p-1 shrink-0 overflow-hidden ${isUnavailable ? 'opacity-50' : ''
                                            }`}>
                                            {item.image_url ? (
                                                <img
                                                    src={getUploadUrl(item.image_url)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            ) : (
                                                <ProductImage type={item.name} className="w-full h-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold truncate text-sm md:text-base ${isUnavailable ? 'text-stone-500 line-through' : 'text-white'
                                                }`}>
                                                {item.name}
                                            </h4>
                                            <p className={`text-xs md:text-sm ${isUnavailable ? 'text-stone-400' : 'text-stone-300'
                                                }`}>
                                                {item.selectedVariation?.name || item.displaySize || item.size} • Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <span className={`font-medium text-sm ${isUnavailable ? 'text-stone-400' : 'text-white'
                                            }`}>
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </span>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 bg-stone-900 rounded-lg px-2 py-1 border border-stone-700">
                                            <button
                                                onClick={() => updateQuantity(cartKey, -1)}
                                                className="text-stone-400 hover:text-white transition-colors p-1"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(cartKey, 1)}
                                                className="text-stone-400 hover:text-white transition-colors p-1"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(cartKey)}
                                            className="text-stone-400 hover:text-red-400 transition-colors p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Price Details */}
                        <div className="mt-auto">
                            <h3 className="text-lg font-bold mb-6 text-white">Price Details</h3>
                            <div className="bg-stone-800/30 rounded-2xl p-6 space-y-4 border border-stone-700/30">
                                <div className="flex justify-between">
                                    <span className="text-stone-300">Items</span>
                                    <span className="font-medium text-white">₦{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-300">Shipping</span>
                                    <span className="font-medium text-white">₦{shippingFee.toLocaleString()}</span>
                                </div>
                                {discount && (
                                    <div className="flex justify-between text-vitality-teal">
                                        <span>Discount ({discount.code})</span>
                                        <span>-₦{(cartTotal + shippingFee - calculateTotal()).toLocaleString()}</span>
                                    </div>
                                )}

                                {hasUnavailableItems && (
                                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                                        <p className="text-amber-800 text-sm font-semibold mb-1">
                                            ⚠️ Unavailable Items in Cart
                                        </p>
                                        <p className="text-amber-700 text-xs">
                                            {unavailableCount} {unavailableCount === 1 ? 'item is' : 'items are'} no longer available. Please remove {unavailableCount === 1 ? 'it' : 'them'} from your cart to continue.
                                        </p>
                                    </div>
                                )}

                                {/* Discount Code Input */}
                                <div className="pt-4 mt-4 border-t border-stone-700/50">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                            className="flex-1 bg-stone-900 border border-stone-700 text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-vitality-teal transition-colors placeholder-stone-500 w-full"
                                            placeholder="Discount Code"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyDiscount}
                                            disabled={validatingCode || !discountCode}
                                            className="bg-vitality-teal hover:bg-vitality-teal/90 text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-6 mt-2 border-t border-stone-700/50">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-white">₦{calculateTotal().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
