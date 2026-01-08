import React, { useState } from 'react';
import { MessageCircle, X, Send, Check } from 'lucide-react';
import { contactService } from '../../services/api';

const ContactBubble = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'Quick Message',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSending(true);

        try {
            await contactService.submitMessage(formData);
            setSent(true);
            setFormData({ name: '', email: '', phone: '', subject: 'Quick Message', message: '' });
            setTimeout(() => {
                setSent(false);
                setIsOpen(false);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Floating Bubble Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen
                    ? 'bg-stone-800 rotate-90'
                    : 'bg-teal-600 hover:bg-teal-700 hover:scale-110'
                    }`}
            >
                {isOpen ? (
                    <X size={24} className="text-white" />
                ) : (
                    <MessageCircle size={24} className="text-white" />
                )}
            </button>

            {/* Chat Widget */}
            <div className={`fixed bottom-24 right-6 z-50 w-80 md:w-96 transform transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'
                }`}>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white">
                        <h3 className="font-bold text-lg">Send us a message</h3>
                        <p className="text-teal-100 text-sm">We'll get back to you soon!</p>
                    </div>

                    {/* Form or Success */}
                    {sent ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h4 className="font-bold text-stone-900 mb-2">Message Sent!</h4>
                            <p className="text-stone-500 text-sm">We'll respond to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-4 space-y-3">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                                    {error}
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number (Optional)"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                            <textarea
                                placeholder="How can we help?"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                                required
                            />
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Backdrop on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default ContactBubble;
