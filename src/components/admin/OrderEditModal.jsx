import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { adminService } from '../../services/api';

const OrderEditModal = ({ order, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        shipping_address: '',
        shipping_city: '',
        shipping_state: '',
        items: []
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (order) {
            setFormData({
                shipping_address: order.shipping_address,
                shipping_city: order.shipping_city,
                shipping_state: order.shipping_state,
                items: order.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    product_name: item.Product?.name
                }))
            });
        }
        fetchProducts();
    }, [order]);

    const fetchProducts = async () => {
        try {
            const response = await adminService.getAdminProducts();
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newItems[index].price = product.price;
                newItems[index].product_name = product.name;
            }
        }

        setFormData({ ...formData, items: newItems });
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', quantity: 1, price: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.updateOrder(order.id, formData);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-stone-900">Edit Order #{order.order_number}</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-900">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-stone-900">Shipping Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                            <input
                                type="text"
                                value={formData.shipping_address}
                                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.shipping_city}
                                    onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">State</label>
                                <input
                                    type="text"
                                    value={formData.shipping_state}
                                    onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-stone-900">Order Items</h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-sm text-stone-900 font-medium flex items-center gap-1 hover:text-stone-700"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end bg-stone-50 p-4 rounded-xl">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-stone-500 mb-1">Product</label>
                                    <select
                                        value={item.product_id}
                                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                                        required
                                    >
                                        <option value="">Select Product</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-20">
                                    <label className="block text-xs font-medium text-stone-500 mb-1">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                                        required
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-stone-500 mb-1">Price</label>
                                    <input
                                        type="number"
                                        value={item.price}
                                        readOnly
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-100 text-sm text-stone-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 text-stone-400 hover:text-red-600"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-stone-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-stone-600 hover:text-stone-900 mr-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-stone-900 text-white px-6 py-2 rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderEditModal;
