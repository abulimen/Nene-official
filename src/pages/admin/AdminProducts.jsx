import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Plus, Edit, Trash2, X, Upload, Package, Check, Pencil } from 'lucide-react';
import { getUploadUrl } from '../../utils/config';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        size: '',
        image_url: '',
        tagline: '',
        ingredients: '',
        nutrition_info: { cal: '', protein: '', fat: '', carbs: '' },
        accent_bg_color: 'bg-stone-100',
        is_available: true,
        images: [],
        variations: []
    });
    const [uploading, setUploading] = useState(false);

    // Variation management state
    const [newVariation, setNewVariation] = useState({ name: '', price: '', is_available: true });
    const [editingVariation, setEditingVariation] = useState(null);
    const [savingVariation, setSavingVariation] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await adminService.getAllProducts();
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Stage the file for upload (don't upload immediately)
        setFormData(prev => ({ ...prev, stagedImage: file, imagePreview: URL.createObjectURL(file) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = formData.image_url;

            // Upload staged image if exists
            if (formData.stagedImage) {
                const imageFormData = new FormData();
                imageFormData.append('image', formData.stagedImage);

                const uploadResponse = await adminService.uploadImage(imageFormData);
                imageUrl = uploadResponse.data.data.filename;
            }

            const payload = {
                ...formData,
                image_url: imageUrl,
                price: parseFloat(formData.price),
                nutrition_info: formData.nutrition_info
            };

            // Remove staged data from payload
            delete payload.stagedImage;
            delete payload.imagePreview;

            if (editingProduct) {
                await adminService.updateProduct(editingProduct.id, payload);
            } else {
                await adminService.createProduct(payload);
            }

            setIsModalOpen(false);
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            size: '',
            image_url: '',
            tagline: '',
            ingredients: '',
            nutrition_info: { cal: '', protein: '', fat: '', carbs: '' },
            accent_bg_color: 'bg-stone-100',
            is_available: true,
            images: [],
            variations: [],
            stagedImage: null,
            imagePreview: null
        });
        setNewVariation({ name: '', price: '', is_available: true });
        setEditingVariation(null);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            size: product.size,
            image_url: product.image_url,
            tagline: product.tagline,
            ingredients: product.ingredients,
            nutrition_info: product.nutrition_info || { cal: '', protein: '', fat: '', carbs: '' },
            accent_bg_color: product.accent_bg_color || 'bg-stone-100',
            is_available: product.is_available !== undefined ? product.is_available : true,
            images: product.images || [],
            variations: product.variations || []
        });
        setNewVariation({ name: '', price: '', is_available: true });
        setEditingVariation(null);
        setIsModalOpen(true);
    };

    // ========== VARIATION MANAGEMENT FUNCTIONS ==========
    const handleAddVariation = async () => {
        if (!newVariation.name || !newVariation.price) {
            alert('Please enter variation name and price');
            return;
        }
        if (!editingProduct) {
            // For new products, just add to local state
            setFormData(prev => ({
                ...prev,
                variations: [...prev.variations, {
                    id: Date.now(), // temporary id
                    ...newVariation,
                    price: parseFloat(newVariation.price),
                    sort_order: prev.variations.length
                }]
            }));
            setNewVariation({ name: '', price: '', is_available: true });
            return;
        }

        setSavingVariation(true);
        try {
            await adminService.createVariation(editingProduct.id, {
                name: newVariation.name,
                price: parseFloat(newVariation.price),
                is_available: newVariation.is_available,
                sort_order: formData.variations.length
            });
            // Refresh product data
            const response = await adminService.getAllProducts();
            const updatedProduct = response.data.data.find(p => p.id === editingProduct.id);
            if (updatedProduct) {
                setFormData(prev => ({ ...prev, variations: updatedProduct.variations || [] }));
                setProducts(response.data.data);
            }
            setNewVariation({ name: '', price: '', is_available: true });
        } catch (error) {
            console.error('Error adding variation:', error);
            alert('Failed to add variation');
        } finally {
            setSavingVariation(false);
        }
    };

    const handleUpdateVariation = async (variation) => {
        if (!editingProduct) return;

        setSavingVariation(true);
        try {
            await adminService.updateVariation(editingProduct.id, variation.id, {
                name: variation.name,
                price: parseFloat(variation.price),
                is_available: variation.is_available
            });
            const response = await adminService.getAllProducts();
            const updatedProduct = response.data.data.find(p => p.id === editingProduct.id);
            if (updatedProduct) {
                setFormData(prev => ({ ...prev, variations: updatedProduct.variations || [] }));
                setProducts(response.data.data);
            }
            setEditingVariation(null);
        } catch (error) {
            console.error('Error updating variation:', error);
            alert('Failed to update variation');
        } finally {
            setSavingVariation(false);
        }
    };

    const handleDeleteVariation = async (variationId) => {
        if (!editingProduct) {
            // For new products, remove from local state
            setFormData(prev => ({
                ...prev,
                variations: prev.variations.filter(v => v.id !== variationId)
            }));
            return;
        }

        if (!window.confirm('Delete this variation?')) return;

        setSavingVariation(true);
        try {
            await adminService.deleteVariation(editingProduct.id, variationId);
            const response = await adminService.getAllProducts();
            const updatedProduct = response.data.data.find(p => p.id === editingProduct.id);
            if (updatedProduct) {
                setFormData(prev => ({ ...prev, variations: updatedProduct.variations || [] }));
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error deleting variation:', error);
            alert('Failed to delete variation');
        } finally {
            setSavingVariation(false);
        }
    };

    const handleToggleVariationAvailability = async (variation) => {
        const updated = { ...variation, is_available: !variation.is_available };
        if (!editingProduct) {
            // For new products, update in local state
            setFormData(prev => ({
                ...prev,
                variations: prev.variations.map(v => v.id === variation.id ? updated : v)
            }));
            return;
        }
        await handleUpdateVariation(updated);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8" data-tour="products-header">
                <h1 className="text-3xl font-serif font-bold text-stone-900">Products</h1>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-stone-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-stone-800 transition-colors"
                    data-tour="add-product-btn"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-tour="products-grid">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-stone-50">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-stone-500 font-medium">Product</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Price</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Size</th>
                                <th className="px-6 py-4 text-stone-500 font-medium">Status</th>
                                <th className="px-6 py-4 text-stone-500 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getUploadUrl(product.image_url) || '/api/placeholder/40/40'}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                                            />
                                            <span className="font-medium text-stone-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">₦{parseFloat(product.price).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-stone-500">{product.size}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-700'}`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_available ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {product.is_available ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-stone-900">
                                {editingProduct ? 'Edit Product' : 'New Product'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Name & Tagline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Tagline</label>
                                    <input
                                        type="text"
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Tags</label>
                                    <input
                                        type="text"
                                        value={formData.tags || ''}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="Greek Yogurt, Protein"
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                    />
                                    <p className="text-xs text-stone-500 mt-1">Comma-separated tags (e.g., Greek Yogurt, Protein)</p>
                                </div>
                            </div>

                            {/* Price & Size */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Price (₦)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Size</label>
                                    <input
                                        type="text"
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        placeholder="e.g. 500g, 330ml"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 h-24"
                                    required
                                />
                            </div>

                            {/* Ingredients */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Ingredients</label>
                                <textarea
                                    value={formData.ingredients}
                                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 h-20"
                                />
                            </div>

                            {/* Nutrition Info */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Nutrition Information</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Calories</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 190"
                                            value={formData.nutrition_info.cal}
                                            onChange={(e) => setFormData({ ...formData, nutrition_info: { ...formData.nutrition_info, cal: e.target.value } })}
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Protein (g)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 10"
                                            value={formData.nutrition_info.protein}
                                            onChange={(e) => setFormData({ ...formData, nutrition_info: { ...formData.nutrition_info, protein: e.target.value } })}
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Fat (g)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 5"
                                            value={formData.nutrition_info.fat}
                                            onChange={(e) => setFormData({ ...formData, nutrition_info: { ...formData.nutrition_info, fat: e.target.value } })}
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 mb-1">Carbohydrates (g)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 20"
                                            value={formData.nutrition_info.carbs}
                                            onChange={(e) => setFormData({ ...formData, nutrition_info: { ...formData.nutrition_info, carbs: e.target.value } })}
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Availability Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Availability Status</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_available ? 'bg-green-600' : 'bg-stone-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className="text-sm text-stone-600">
                                        {formData.is_available ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-500 mt-1">
                                    When out of stock, customers cannot add this product to their cart
                                </p>
                            </div>

                            {/* Main Image */}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Main Image</label>
                                <div className="flex items-center gap-4">
                                    {(formData.imagePreview || formData.image_url) && (
                                        <div className="relative">
                                            <img
                                                src={formData.imagePreview || getUploadUrl(formData.image_url)}
                                                alt="Preview"
                                                className="w-16 h-16 object-cover rounded-lg bg-stone-100"
                                            />
                                            {formData.imagePreview && (
                                                <span className="absolute -top-2 -right-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                                                    Staged
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                                    />
                                </div>
                                {uploading && <p className="text-xs text-stone-500 mt-1">Uploading image...</p>}
                                {formData.stagedImage && <p className="text-xs text-amber-600 mt-1">Image will be uploaded when you save the product</p>}
                            </div>

                            {/* Additional Images Gallery */}
                            {editingProduct && (
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Additional Images</label>

                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        {formData.images && formData.images.map((img) => (
                                            <div key={img.id} className="relative group aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                                                <img
                                                    src={getUploadUrl(img.image_url)}
                                                    alt="Product view"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (window.confirm('Delete this image?')) {
                                                            try {
                                                                await adminService.deleteProductImage(editingProduct.id, img.id);
                                                                const response = await adminService.getAllProducts();
                                                                const updatedProduct = response.data.data.find(p => p.id === editingProduct.id);
                                                                if (updatedProduct) {
                                                                    setFormData(prev => ({ ...prev, images: updatedProduct.images || [] }));
                                                                    setProducts(response.data.data);
                                                                }
                                                            } catch (err) {
                                                                console.error('Failed to delete image', err);
                                                                alert('Failed to delete image');
                                                            }
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add New Image Button */}
                                        <label className="flex flex-col items-center justify-center aspect-square bg-stone-50 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                                            <Plus size={24} className="text-stone-400 mb-1" />
                                            <span className="text-xs text-stone-500 font-medium">Add Image</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    try {
                                                        const uploadFormData = new FormData();
                                                        uploadFormData.append('image', file);
                                                        const response = await adminService.uploadImage(uploadFormData);
                                                        const uploadData = response.data;

                                                        if (uploadData.success) {
                                                            await adminService.addProductImage(editingProduct.id, {
                                                                image_url: uploadData.data.url,
                                                                is_primary: false,
                                                                display_order: (formData.images?.length || 0) + 1
                                                            });

                                                            const response = await adminService.getAllProducts();
                                                            const updatedProduct = response.data.data.find(p => p.id === editingProduct.id);
                                                            if (updatedProduct) {
                                                                setFormData(prev => ({ ...prev, images: updatedProduct.images || [] }));
                                                                setProducts(response.data.data);
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.error('Failed to upload image', err);
                                                        alert('Failed to upload image');
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-stone-500">Click "Add Image" to upload additional views. Hover over an image to delete it.</p>
                                </div>
                            )}

                            {/* ========== PRODUCT VARIATIONS SECTION ========== */}
                            <div className="border-t border-stone-200 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Package size={18} className="text-teal-600" />
                                        <h3 className="font-semibold text-stone-900">Size Variations</h3>
                                        <span className="text-xs text-stone-400">({formData.variations?.length || 0})</span>
                                    </div>
                                </div>

                                {/* Variations List */}
                                {formData.variations && formData.variations.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {formData.variations.map((variation) => (
                                            <div
                                                key={variation.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border ${variation.is_available ? 'border-stone-200 bg-stone-50' : 'border-red-100 bg-red-50'}`}
                                            >
                                                {editingVariation?.id === variation.id ? (
                                                    /* Edit Mode */
                                                    <>
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <input
                                                                type="text"
                                                                value={editingVariation.name}
                                                                onChange={(e) => setEditingVariation({ ...editingVariation, name: e.target.value })}
                                                                className="flex-1 px-2 py-1 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                                autoFocus
                                                            />
                                                            <span className="text-stone-400">₦</span>
                                                            <input
                                                                type="number"
                                                                value={editingVariation.price}
                                                                onChange={(e) => setEditingVariation({ ...editingVariation, price: e.target.value })}
                                                                className="w-24 px-2 py-1 rounded-lg border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateVariation(editingVariation)}
                                                                disabled={savingVariation || !editingVariation.name || !editingVariation.price}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Save"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingVariation(null)}
                                                                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    /* View Mode */
                                                    <>
                                                        <div
                                                            className="flex items-center gap-4 flex-1 cursor-pointer hover:text-teal-600"
                                                            onClick={() => setEditingVariation({ ...variation })}
                                                            title="Click to edit"
                                                        >
                                                            <span className="font-medium text-stone-900">{variation.name}</span>
                                                            <span className="text-stone-600">₦{parseFloat(variation.price).toLocaleString()}</span>
                                                            <Pencil size={12} className="text-stone-400" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {/* Availability Toggle */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleVariationAvailability(variation)}
                                                                disabled={savingVariation}
                                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${variation.is_available ? 'bg-green-500' : 'bg-stone-300'} disabled:opacity-50`}
                                                            >
                                                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${variation.is_available ? 'translate-x-5' : 'translate-x-1'}`} />
                                                            </button>
                                                            <span className={`text-xs w-16 ${variation.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                                                {variation.is_available ? 'In Stock' : 'Out'}
                                                            </span>
                                                            {/* Delete Button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteVariation(variation.id)}
                                                                disabled={savingVariation}
                                                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Variation Form */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="e.g. 250ml, 1 Litre"
                                        value={newVariation.name}
                                        onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })}
                                        className="flex-1 px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newVariation.price}
                                        onChange={(e) => setNewVariation({ ...newVariation, price: e.target.value })}
                                        className="w-28 px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddVariation}
                                        disabled={savingVariation || !newVariation.name || !newVariation.price}
                                        className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                </div>
                                <p className="text-xs text-stone-500 mt-2">
                                    Add different sizes with prices. Each variation can be marked in/out of stock individually.
                                </p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-stone-600 hover:text-stone-900 mr-4"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-stone-900 text-white px-6 py-2 rounded-xl hover:bg-stone-800 transition-colors"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
