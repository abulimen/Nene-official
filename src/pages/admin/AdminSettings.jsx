import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Plus, Trash2, Save, Send, Phone, Mail, MapPin, Clock, MessageCircle, HelpCircle, ExternalLink } from 'lucide-react';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('shipping');

    const tabs = [
        { id: 'shipping', label: 'Shipping' },
        { id: 'discounts', label: 'Discounts' },
        { id: 'social', label: 'Social Media' },
        { id: 'contact', label: 'Contact Info' },
        { id: 'telegram', label: 'Telegram' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Settings</h1>

            <div className="flex gap-4 mb-8 border-b border-stone-200 overflow-x-auto" data-tour="settings-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-500 hover:text-stone-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'shipping' && <ShippingSettings />}
            {activeTab === 'discounts' && <DiscountSettings />}
            {activeTab === 'social' && <SocialMediaSettings />}
            {activeTab === 'contact' && <ContactInfoSettings />}
            {activeTab === 'telegram' && <TelegramSettings />}
        </div>
    );
};

const ShippingSettings = () => {
    const [configs, setConfigs] = useState([]);
    const [newState, setNewState] = useState({ state_name: '', shipping_fee: '' });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await adminService.getAdminShipping();
            setConfigs(response.data.data);
        } catch (error) {
            console.error('Error fetching shipping:', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await adminService.createShipping(newState);
            setNewState({ state_name: '', shipping_fee: '' });
            fetchConfigs();
        } catch (error) {
            console.error('Error adding shipping:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this shipping rate?')) {
            try {
                await adminService.deleteShipping(id);
                fetchConfigs();
            } catch (error) {
                console.error('Error deleting shipping:', error);
            }
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Add New Rate</h3>
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="State Name"
                        value={newState.state_name}
                        onChange={(e) => setNewState({ ...newState, state_name: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Fee (₦)"
                        value={newState.shipping_fee}
                        onChange={(e) => setNewState({ ...newState, shipping_fee: e.target.value })}
                        className="w-32 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                    />
                    <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-800">
                        <Plus size={20} />
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-stone-50">
                        <tr className="text-left">
                            <th className="px-6 py-4 text-stone-500 font-medium">State</th>
                            <th className="px-6 py-4 text-stone-500 font-medium">Shipping Fee</th>
                            <th className="px-6 py-4 text-stone-500 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {configs.map((config) => (
                            <tr key={config.id}>
                                <td className="px-6 py-4 font-medium text-stone-900">{config.state_name}</td>
                                <td className="px-6 py-4 text-stone-600">₦{parseFloat(config.shipping_fee).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(config.id)}
                                        className="text-stone-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DiscountSettings = () => {
    const [discounts, setDiscounts] = useState([]);
    const [error, setError] = useState(null);
    const [newDiscount, setNewDiscount] = useState({
        code: '', type: 'percentage', value: '', min_order_amount: '', expires_at: ''
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const response = await adminService.getAdminDiscounts();
            setDiscounts(response.data.data);
        } catch (error) {
            console.error('Error fetching discounts:', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await adminService.createDiscount(newDiscount);
            setNewDiscount({ code: '', type: 'percentage', value: '', min_order_amount: '', expires_at: '' });
            fetchDiscounts();
        } catch (error) {
            console.error('Error adding discount:', error);
            setError(error.response?.data?.error?.message || 'Error adding discount');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Deactivate this discount code?')) {
            try {
                await adminService.deleteDiscount(id);
                fetchDiscounts();
            } catch (error) {
                console.error('Error deleting discount:', error);
            }
        }
    };

    return (
        <div>
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Add Discount Code</h3>
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                        type="text"
                        placeholder="Code (e.g. SUMMER10)"
                        value={newDiscount.code}
                        onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                        className="px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                    />
                    <select
                        value={newDiscount.type}
                        onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₦)</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Value"
                        value={newDiscount.value}
                        onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                    />
                    <input
                        type="date"
                        value={newDiscount.expires_at}
                        onChange={(e) => setNewDiscount({ ...newDiscount, expires_at: e.target.value })}
                        className="px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                    <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-800">
                        Add Code
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-stone-50">
                        <tr className="text-left">
                            <th className="px-6 py-4 text-stone-500 font-medium">Code</th>
                            <th className="px-6 py-4 text-stone-500 font-medium">Type</th>
                            <th className="px-6 py-4 text-stone-500 font-medium">Value</th>
                            <th className="px-6 py-4 text-stone-500 font-medium">Expires</th>
                            <th className="px-6 py-4 text-stone-500 font-medium">Status</th>
                            <th className="px-6 py-4 text-stone-500 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {discounts.map((discount) => (
                            <tr key={discount.id}>
                                <td className="px-6 py-4 font-bold text-stone-900">{discount.code}</td>
                                <td className="px-6 py-4 text-stone-600 capitalize">{discount.discount_type}</td>
                                <td className="px-6 py-4 text-stone-600">
                                    {discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `₦${discount.discount_value}`}
                                </td>
                                <td className="px-6 py-4 text-stone-600">
                                    {discount.expires_at ? new Date(discount.expires_at).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${discount.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {discount.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {discount.is_active && (
                                        <button
                                            onClick={() => handleDelete(discount.id)}
                                            className="text-stone-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SocialMediaSettings = () => {
    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState({ platform: '', url: '', icon: 'Link' });

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const response = await adminService.getAdminSocialMedia();
            setLinks(response.data.data);
        } catch (error) {
            console.error('Error fetching social links:', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await adminService.createSocialMedia(newLink);
            setNewLink({ platform: '', url: '', icon: 'Link' });
            fetchLinks();
        } catch (error) {
            console.error('Error adding link:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this link?')) {
            try {
                await adminService.deleteSocialMedia(id);
                fetchLinks();
            } catch (error) {
                console.error('Error deleting link:', error);
            }
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Add Social Link</h3>
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Platform (e.g. Instagram)"
                        value={newLink.platform}
                        onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                    />
                    <input
                        type="url"
                        placeholder="URL"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                    />
                    <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-800">
                        <Plus size={20} />
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-stone-50">
                        <tr className="text-left">
                            <th className="px-6 py-4 text-stone-500 font-medium">Platform</th>
                            <th className="px-6 py-4 text-stone-500 font-medium">URL</th>
                            <th className="px-6 py-4 text-stone-500 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {links.map((link) => (
                            <tr key={link.id}>
                                <td className="px-6 py-4 font-medium text-stone-900">{link.platform}</td>
                                <td className="px-6 py-4 text-stone-600 truncate max-w-xs">{link.url}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        className="text-stone-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ContactInfoSettings = () => {
    const [contactInfo, setContactInfo] = useState({
        phone: '',
        email: '',
        address: '',
        business_hours: '',
        whatsapp: '',
        city: '',
        hero_title: '',
        hero_subtitle: '',
        footer_tagline: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            const response = await adminService.getContactInfo();
            if (response.data.data) {
                setContactInfo(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching contact info:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await adminService.updateContactInfo(contactInfo);
            setMessage('Contact information saved successfully!');
        } catch (error) {
            setMessage('Error saving contact information');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            {/* Hero & Footer Texts */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <h3 className="text-lg font-bold text-stone-900 mb-2">Website Content</h3>
                <p className="text-stone-500 text-sm mb-6">Customize the text displayed in the Hero banner and Footer.</p>

                {message && (
                    <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Hero Title
                        </label>
                        <input
                            type="text"
                            value={contactInfo.hero_title || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, hero_title: e.target.value })}
                            placeholder="Handcrafted with Love"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                        <p className="text-xs text-stone-500 mt-1">Main heading displayed in the Hero banner.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Hero Subtitle
                        </label>
                        <textarea
                            value={contactInfo.hero_subtitle || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, hero_subtitle: e.target.value })}
                            placeholder="Discover our artisanal yogurt collection, made fresh daily..."
                            rows="2"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                        <p className="text-xs text-stone-500 mt-1">Description text below the Hero title.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Footer Tagline
                        </label>
                        <textarea
                            value={contactInfo.footer_tagline || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, footer_tagline: e.target.value })}
                            placeholder="Handcrafted artisanal yogurt made with love and premium ingredients..."
                            rows="2"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                        <p className="text-xs text-stone-500 mt-1">Brand description displayed in the website Footer.</p>
                    </div>

                    <div className="border-t border-stone-100 pt-4 mt-6">
                        <h4 className="text-md font-bold text-stone-800 mb-4">Contact Details</h4>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <MapPin size={16} /> City / Location
                        </label>
                        <input
                            type="text"
                            value={contactInfo.city || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                            placeholder="Lagos, Nigeria"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                        <p className="text-xs text-stone-500 mt-1">Displayed in the Hero banner and Footer.</p>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <Phone size={16} /> Phone Number
                        </label>
                        <input
                            type="text"
                            value={contactInfo.phone || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                            placeholder="+234 800 123 4567"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <Mail size={16} /> Email Address
                        </label>
                        <input
                            type="email"
                            value={contactInfo.email || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                            placeholder="hello@nene.ng"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <MapPin size={16} /> Address
                        </label>
                        <textarea
                            value={contactInfo.address || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                            placeholder="123 Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                            rows="2"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <Clock size={16} /> Business Hours
                        </label>
                        <input
                            type="text"
                            value={contactInfo.business_hours || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, business_hours: e.target.value })}
                            placeholder="Mon-Fri 9am to 5pm"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                            <MessageCircle size={16} /> WhatsApp Number (Optional)
                        </label>
                        <input
                            type="text"
                            value={contactInfo.whatsapp || ''}
                            onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                            placeholder="+234 800 123 4567"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const TelegramSettings = () => {
    const [config, setConfig] = useState({
        bot_token: '',
        chat_id: '',
        is_enabled: false,
        notify_on_purchase: true,
        notify_on_review: true
    });
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await adminService.getTelegramConfig();
            if (response.data.data) {
                setConfig(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching Telegram config:', error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await adminService.updateTelegramConfig(config);
            setMessage('Telegram configuration saved!');
            fetchConfig();
        } catch (error) {
            setMessage('Error saving configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setMessage('');
        try {
            const response = await adminService.testTelegramMessage();
            setMessage(response.data.message || 'Test message sent!');
        } catch (error) {
            setMessage(error.response?.data?.error?.message || 'Failed to send test message');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="max-w-2xl">
            {/* Setup Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                        <HelpCircle size={20} />
                        How to set up Telegram notifications
                    </div>
                    <span className="text-blue-600">{showGuide ? '▲ Hide' : '▼ Show'}</span>
                </button>

                {showGuide && (
                    <div className="mt-4 text-sm text-blue-800 space-y-4">
                        <div className="bg-white rounded-xl p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2">
                                Step 1: Create a Telegram Bot
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-blue-700">
                                <li>Open Telegram and search for <strong>@BotFather</strong></li>
                                <li>Send <code className="bg-blue-100 px-1.5 py-0.5 rounded">/newbot</code> to create a new bot</li>
                                <li>Give your bot a name (e.g., "Nené Store Alerts")</li>
                                <li>Give your bot a username (e.g., "nene_store_bot")</li>
                                <li>Copy the <strong>API token</strong> that BotFather gives you</li>
                            </ol>
                            <a
                                href="https://t.me/BotFather"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                            >
                                Open BotFather <ExternalLink size={14} />
                            </a>
                        </div>

                        <div className="bg-white rounded-xl p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2">
                                Step 2: Get Your Chat ID
                            </h4>
                            <p className="text-blue-700">For a <strong>Group</strong>:</p>
                            <ol className="list-decimal list-inside space-y-2 text-blue-700">
                                <li>Create a new Telegram group or use an existing one</li>
                                <li>Add your bot to the group</li>
                                <li>Send a message in the group</li>
                                <li>Open this URL in your browser (replace YOUR_BOT_TOKEN with your token):</li>
                            </ol>
                            <code className="block bg-blue-100 px-3 py-2 rounded text-xs overflow-x-auto">
                                https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
                            </code>
                            <p className="text-blue-700">Look for <code className="bg-blue-100 px-1.5 py-0.5 rounded">"chat":&#123;"id":-1001234567890&#125;</code> - that's your Chat ID</p>

                            <p className="text-blue-700 mt-4">For <strong>Personal Messages</strong>:</p>
                            <ol className="list-decimal list-inside space-y-2 text-blue-700">
                                <li>Search for <strong>@userinfobot</strong> on Telegram</li>
                                <li>Send /start - it will reply with your user ID</li>
                            </ol>
                        </div>

                        <div className="bg-white rounded-xl p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2">
                                Step 3: Configure Below
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-blue-700">
                                <li>Paste your <strong>Bot Token</strong> in the field below</li>
                                <li>Paste your <strong>Chat ID</strong> (include the minus sign for groups)</li>
                                <li>Enable notifications and choose what to be notified about</li>
                                <li>Click <strong>Test</strong> to verify it works!</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <h3 className="text-lg font-bold text-stone-900 mb-2">Telegram Bot Notifications</h3>
                <p className="text-stone-500 text-sm mb-6">
                    Receive instant alerts when customers make purchases or leave reviews.
                </p>

                {message && (
                    <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-stone-700 mb-2 block">Bot Token</label>
                        <input
                            type="text"
                            value={config.bot_token || ''}
                            onChange={(e) => setConfig({ ...config, bot_token: e.target.value })}
                            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono text-sm"
                        />
                        <p className="text-xs text-stone-400 mt-1">The token you received from @BotFather</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-stone-700 mb-2 block">Chat ID</label>
                        <input
                            type="text"
                            value={config.chat_id || ''}
                            onChange={(e) => setConfig({ ...config, chat_id: e.target.value })}
                            placeholder="-1001234567890"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono text-sm"
                        />
                        <p className="text-xs text-stone-400 mt-1">Your user ID or group/channel ID (include the minus sign)</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-stone-100">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-stone-700">Enable Notifications</span>
                            <input
                                type="checkbox"
                                checked={config.is_enabled}
                                onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
                                className="w-5 h-5 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-stone-600">Notify on new purchases</span>
                            <input
                                type="checkbox"
                                checked={config.notify_on_purchase}
                                onChange={(e) => setConfig({ ...config, notify_on_purchase: e.target.checked })}
                                className="w-5 h-5 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-stone-600">Notify on new reviews</span>
                            <input
                                type="checkbox"
                                checked={config.notify_on_review}
                                onChange={(e) => setConfig({ ...config, notify_on_review: e.target.checked })}
                                className="w-5 h-5 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                            />
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={testing || !config.bot_token || !config.chat_id}
                            className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Send size={18} />
                            {testing ? 'Sending...' : 'Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
