import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const StatusUpdateModal = ({ order, onClose, onUpdate }) => {
    const [newStatus, setNewStatus] = useState(order.order_status);
    const [notes, setNotes] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [updating, setUpdating] = useState(false);

    const cancellationReasons = [
        'Customer requested cancellation',
        'Payment not received',
        'Product out of stock',
        'Unable to deliver to address',
        'Fraudulent order suspected',
        'Other (specify below)'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            // Build notes with cancellation reason if cancelled
            let finalNotes = notes;
            if (newStatus === 'cancelled') {
                const reason = cancellationReason === 'Other (specify below)'
                    ? customReason
                    : cancellationReason;
                if (reason) {
                    finalNotes = `Cancellation reason: ${reason}${notes ? `. ${notes}` : ''}`;
                }
            }
            await onUpdate(newStatus, finalNotes);
            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const isCancelling = newStatus === 'cancelled';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-stone-900">Update Order Status</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            New Status
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Cancellation Warning & Reason */}
                    {isCancelling && (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">You are about to cancel this order</p>
                                    <p className="text-xs text-red-600 mt-1">This action will notify the customer via email.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Cancellation Reason <span className="text-stone-400 font-normal">(optional)</span>
                                </label>
                                <div className="space-y-2">
                                    {cancellationReasons.map((reason) => (
                                        <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="cancellationReason"
                                                value={reason}
                                                checked={cancellationReason === reason}
                                                onChange={(e) => setCancellationReason(e.target.value)}
                                                className="w-4 h-4 text-red-500 border-stone-300 focus:ring-red-500"
                                            />
                                            <span className="text-sm text-stone-600 group-hover:text-stone-900">{reason}</span>
                                        </label>
                                    ))}
                                </div>

                                {cancellationReason === 'Other (specify below)' && (
                                    <input
                                        type="text"
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder="Enter custom reason..."
                                        className="w-full mt-3 px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Additional Notes <span className="text-stone-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24 resize-none text-sm"
                            placeholder="Add any notes about this status change..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-stone-600 hover:text-stone-900 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updating || newStatus === order.order_status}
                            className={`px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isCancelling
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-stone-900 text-white hover:bg-stone-800'
                                }`}
                        >
                            {updating ? 'Updating...' : isCancelling ? 'Confirm Cancellation' : 'Update Status'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusUpdateModal;
