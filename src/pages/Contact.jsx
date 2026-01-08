import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { contactService } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
    const { contactInfo } = useSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await contactService.submitMessage(formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-stone-500 text-sm tracking-widest uppercase mb-2 block">Get in Touch</span>
                <h1 className="font-serif text-4xl text-stone-800 mb-4">Contact Us</h1>
                <div className="w-24 h-1 bg-stone-800 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div>
                    <h3 className="text-2xl font-serif font-bold text-stone-800 mb-6">We'd love to hear from you</h3>
                    <p className="text-stone-600 mb-8 leading-relaxed">
                        Have a question about our products, shipping, or just want to say hello?
                        Fill out the form or reach out to us directly using the contact information below.
                    </p>

                    <div className="space-y-6">
                        {contactInfo?.phone && (
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 mb-1">Phone</h4>
                                    <a href={`tel:${contactInfo.phone}`} className="text-stone-600 hover:text-teal-600">{contactInfo.phone}</a>
                                    {contactInfo.business_hours && (
                                        <p className="text-stone-500 text-sm">{contactInfo.business_hours}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {contactInfo?.email && (
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 mb-1">Email</h4>
                                    <a href={`mailto:${contactInfo.email}`} className="text-stone-600 hover:text-teal-600">{contactInfo.email}</a>
                                    <p className="text-stone-500 text-sm">We'll reply within 24 hours</p>
                                </div>
                            </div>
                        )}

                        {contactInfo?.address && (
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 mb-1">Office</h4>
                                    <p className="text-stone-600">{contactInfo.address}</p>
                                </div>
                            </div>
                        )}

                        {contactInfo?.whatsapp && (
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-800 mb-1">WhatsApp</h4>
                                    <a
                                        href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-stone-600 hover:text-green-600"
                                    >
                                        {contactInfo.whatsapp}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                    {submitted ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">Message Sent!</h3>
                            <p className="text-stone-600">Thank you for reaching out. We'll get back to you shortly.</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 text-teal-600 font-medium hover:text-teal-700"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        placeholder="+234 800 000 0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        placeholder="How can we help?"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                    placeholder="Your message..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;

