import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, AlertCircle } from 'lucide-react';
import { getApiBaseUrl } from '../utils/config';

const ShippingPolicy = () => {
    const [shippingStates, setShippingStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShippingRates = async () => {
            try {
                const API_URL = getApiBaseUrl();
                const response = await axios.get(`${API_URL}/shipping/states`);
                if (response.data.success) {
                    setShippingStates(response.data.data);
                } else {
                    setError('Failed to load shipping information');
                }
            } catch (err) {
                console.error('Error fetching shipping rates:', err);
                setError('Unable to load shipping rates at this time.');
            } finally {
                setLoading(false);
            }
        };

        fetchShippingRates();
    }, []);

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-full mb-6 text-vitality-teal">
                        <Truck size={32} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-nene-black font-serif mb-6">
                        Shipping Policy
                    </h1>
                    <p className="text-stone-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        We currently deliver our fresh, artisanal dairy products to selected locations across Nigeria.
                        Please check below to see if we deliver to your area and the associated shipping fees.
                    </p>
                </div>

                {/* Content */}
                <div className="bg-stone-50 rounded-3xl p-8 md:p-12 shadow-sm border border-stone-100">
                    <div className="flex items-start gap-4 mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                        <div className="text-sm text-blue-800">
                            <p className="font-bold mb-1">Important Delivery Information</p>
                            <p>Orders placed before 12 PM are typically processed the same day. Delivery times may vary based on your location and order volume.</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-nene-black mb-6 font-serif flex items-center gap-2">
                        <MapPin className="text-vitality-teal" size={24} />
                        Delivery Locations & Rates
                    </h2>

                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vitality-teal"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-8 bg-red-50 rounded-xl border border-red-100">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-stone-100 border-b border-stone-200">
                                        <th className="py-4 px-6 font-bold text-stone-700 text-sm uppercase tracking-wider">State / Location</th>
                                        <th className="py-4 px-6 font-bold text-stone-700 text-sm uppercase tracking-wider text-right">Shipping Fee</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {shippingStates.length > 0 ? (
                                        shippingStates.map((state) => (
                                            <tr key={state.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="py-4 px-6 text-stone-800 font-medium">{state.state_name}</td>
                                                <td className="py-4 px-6 text-stone-600 text-right font-mono">
                                                    ₦{parseFloat(state.shipping_fee).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="py-8 text-center text-stone-500">
                                                No shipping locations currently available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-8 text-sm text-stone-500 italic">
                        * Shipping rates are subject to change. The final shipping cost will be calculated at checkout.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
