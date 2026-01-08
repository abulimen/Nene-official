import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Move } from 'lucide-react';
import { adminService } from '../../services/api';

const AdminFAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        display_order: 0,
        is_active: true
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const response = await adminService.getAdminFAQs();
            setFaqs(response.data.data || []);
        } catch (error) {
            console.error('Failed to load FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (faq) => {
        setEditingId(faq.id);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            display_order: faq.display_order,
            is_active: faq.is_active
        });
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            question: '',
            answer: '',
            display_order: faqs.length + 1,
            is_active: true
        });
        setIsCreating(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({
            question: '',
            answer: '',
            display_order: 0,
            is_active: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isCreating) {
                await adminService.createFAQ(formData);
            } else {
                await adminService.updateFAQ(editingId, formData);
            }
            await fetchFAQs();
            handleCancel();
        } catch (error) {
            console.error('Failed to save FAQ:', error);
            alert('Failed to save FAQ');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await adminService.deleteFAQ(id);
                await fetchFAQs();
            } catch (error) {
                console.error('Failed to delete FAQ:', error);
                alert('Failed to delete FAQ');
            }
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8" data-tour="faq-header">
                <h1 className="text-2xl font-bold font-serif text-stone-800">FAQ Management</h1>
                {!isCreating && !editingId && (
                    <button
                        onClick={handleCreate}
                        className="bg-stone-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-stone-800"
                        data-tour="add-faq-btn"
                    >
                        <Plus size={20} />
                        Add New FAQ
                    </button>
                )}
            </div>

            {(isCreating || editingId) && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-8">
                    <h3 className="font-bold text-lg mb-4">{isCreating ? 'Create New FAQ' : 'Edit FAQ'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Question</label>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Answer</label>
                            <textarea
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-32"
                                required
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Order</label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    className="w-full p-2 border border-stone-300 rounded-lg"
                                />
                            </div>
                            <div className="flex items-center sm:pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-stone-700">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                            >
                                <Save size={18} />
                                Save FAQ
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden" data-tour="faq-list">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="p-4 font-medium text-stone-500 w-16">Order</th>
                                <th className="p-4 font-medium text-stone-500">Question</th>
                                <th className="p-4 font-medium text-stone-500 w-24">Status</th>
                                <th className="p-4 font-medium text-stone-500 w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {faqs.map((faq) => (
                                <tr key={faq.id} className="hover:bg-stone-50">
                                    <td className="p-4 text-stone-500">{faq.display_order}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-stone-900">{faq.question}</div>
                                        <div className="text-sm text-stone-500 line-clamp-1">{faq.answer}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${faq.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                                            }`}>
                                            {faq.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(faq)}
                                                className="p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(faq.id)}
                                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {faqs.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-stone-500 italic">
                                        No FAQs found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFAQ;
