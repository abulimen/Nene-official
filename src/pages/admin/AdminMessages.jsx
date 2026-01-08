import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Mail, MailOpen, Trash2, ChevronLeft, ChevronRight, RefreshCw, Eye, X, Phone } from 'lucide-react';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filterUnread, setFilterUnread] = useState(false);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (filterUnread) params.unread_only = 'true';

            const response = await adminService.getMessages(params);
            setMessages(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await adminService.getUnreadCount();
            setUnreadCount(response.data.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchUnreadCount();
    }, [page, filterUnread]);

    const handleMarkAsRead = async (id) => {
        try {
            await adminService.markMessageAsRead(id);
            setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await adminService.deleteMessage(id);
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleViewMessage = async (message) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            handleMarkAsRead(message.id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper to get date from message (handles both snake_case and camelCase)
    const getMessageDate = (message) => {
        return message.created_at || message.createdAt;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6" data-tour="messages-header">
                <div>
                    <h1 className="text-2xl font-bold text-nene-black">Messages</h1>
                    <p className="text-stone-500 text-sm">
                        {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilterUnread(!filterUnread)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterUnread
                            ? 'bg-teal-600 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        data-tour="messages-filter"
                    >
                        {filterUnread ? 'Show All' : 'Unread Only'}
                    </button>
                    <button
                        onClick={fetchMessages}
                        className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 rounded-xl">
                    <Mail size={48} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-lg font-medium text-stone-600">No messages</h3>
                    <p className="text-stone-400">Messages from the contact form will appear here</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden" data-tour="messages-list">
                    <table className="w-full">
                        <thead className="bg-stone-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider w-10"></th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">From</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {messages.map((message) => (
                                <tr
                                    key={message.id}
                                    className={`hover:bg-stone-50 cursor-pointer transition-colors ${!message.is_read ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => handleViewMessage(message)}
                                >
                                    <td className="px-4 py-4">
                                        {message.is_read ? (
                                            <MailOpen size={18} className="text-stone-400" />
                                        ) : (
                                            <Mail size={18} className="text-teal-600" />
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className={`font-medium ${!message.is_read ? 'text-nene-black' : 'text-stone-600'}`}>
                                            {message.name}
                                        </div>
                                        <div className="text-sm text-stone-400">{message.email}</div>
                                        {message.phone && (
                                            <div className="text-sm text-stone-400 flex items-center gap-1">
                                                <Phone size={12} />
                                                {message.phone}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className={`${!message.is_read ? 'font-semibold text-nene-black' : 'text-stone-600'}`}>
                                            {message.subject}
                                        </div>
                                        <div className="text-sm text-stone-400 truncate max-w-xs">
                                            {message.message.substring(0, 60)}...
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-stone-500">
                                        {formatDate(getMessageDate(message))}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(message.id); }}
                                            className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-t">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="text-sm text-stone-500">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold text-nene-black">{selectedMessage.subject}</h3>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="p-2 hover:bg-stone-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                                    {selectedMessage.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-nene-black">{selectedMessage.name}</div>
                                    <a href={`mailto:${selectedMessage.email}`} className="text-sm text-teal-600 hover:underline">
                                        {selectedMessage.email}
                                    </a>
                                    {selectedMessage.phone && (
                                        <a href={`tel:${selectedMessage.phone}`} className="flex items-center gap-1 text-sm text-stone-500 hover:text-teal-600 mt-0.5">
                                            <Phone size={14} />
                                            {selectedMessage.phone}
                                        </a>
                                    )}
                                </div>
                                <div className="ml-auto text-sm text-stone-400">
                                    {formatDate(getMessageDate(selectedMessage))}
                                </div>
                            </div>
                            <div className="prose prose-stone max-w-none">
                                <p className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-stone-50 flex gap-3">
                            <a
                                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-medium text-center hover:bg-teal-700 transition-colors"
                            >
                                Reply via Email
                            </a>
                            <button
                                onClick={() => { handleDelete(selectedMessage.id); }}
                                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
