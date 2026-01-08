import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import ProductImage from '../ui/ProductImage';
import { useCart } from '../../context/CartContext';
import { getUploadUrl } from '../../utils/config';
import { useEffect } from 'react';

const Cart = ({ cartItems = [], isOpen, onClose, onUpdateQuantity, onRemove, onCheckout }) => {
    const { syncCartWithDatabase } = useCart();
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Check if any items are unavailable (deleted or out of stock)
    const hasUnavailableItems = cartItems.some(item => !item.is_active || !item.is_available);
    const unavailableCount = cartItems.filter(item => !item.is_active || !item.is_available).length;

    // Sync cart with database when cart is opened
    useEffect(() => {
        if (isOpen) {
            syncCartWithDatabase();
        }
    }, [isOpen]);

    return (
        <>
            {/* Cart Drawer Overlay */}
            <div
                className={`fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Cart Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[70] transform transition-transform duration-300 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <h2 className="text-2xl font-bold font-serif">Your Order</h2>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-900"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-20">
                            <ShoppingBag size={48} className="mx-auto text-stone-200 mb-4" />
                            <p className="text-stone-500">Your bag is empty.</p>
                        </div>
                    ) : (
                        cartItems.map(item => {
                            const isUnavailable = !item.is_active || !item.is_available;
                            // Generate unique key for cart item (handles variations)
                            const cartKey = item.cartKey || (item.selectedVariation
                                ? `${item.id}_${item.selectedVariation.id}`
                                : item.id);
                            return (
                                <div key={cartKey} className={`flex gap-4 bg-stone-50 p-4 rounded-xl border ${isUnavailable ? 'border-amber-300 bg-amber-50/30' : 'border-stone-100'}`}>
                                    {/* Unavailable Badge */}
                                    {isUnavailable && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                {!item.is_active ? 'Deleted' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`w-20 h-20 flex items-center justify-center shrink-0 bg-white rounded-lg p-2 overflow-hidden ${isUnavailable ? 'opacity-50' : ''}`}>
                                        {item.image_url ? (
                                            <img
                                                src={getUploadUrl(item.image_url)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ProductImage type={item.name} className="w-full h-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <h4 className={`font-bold ${isUnavailable ? 'text-stone-500 line-through' : 'text-stone-900'}`}>{item.name}</h4>
                                            <span className={`font-medium ${isUnavailable ? 'text-stone-400' : 'text-teal-600'}`}>₦{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                        {/* Variation/Size display */}
                                        <p className="text-sm text-stone-500">
                                            {item.displaySize || item.selectedVariation?.name || item.size}
                                        </p>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className={`flex items-center gap-3 bg-white rounded-full px-3 py-1 border border-stone-200 ${isUnavailable ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <button onClick={() => onUpdateQuantity(cartKey, -1)} disabled={isUnavailable}><Minus size={14} /></button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => onUpdateQuantity(cartKey, 1)} disabled={isUnavailable}><Plus size={14} /></button>
                                            </div>
                                            <button onClick={() => onRemove(cartKey)} className="text-stone-400 hover:text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="p-8 border-t border-stone-100 bg-stone-50">
                        <div className="flex justify-between mb-4 text-xl font-bold">
                            <span>Total</span>
                            <span>₦{total.toLocaleString()}</span>
                        </div>
                        {hasUnavailableItems && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-amber-800 text-sm font-medium">
                                    ⚠️ {unavailableCount} {unavailableCount === 1 ? 'item is' : 'items are'} unavailable. Please remove {unavailableCount === 1 ? 'it' : 'them'} to proceed.
                                </p>
                            </div>
                        )}
                        <button
                            onClick={onCheckout}
                            disabled={hasUnavailableItems}
                            className={`w-full py-4 rounded-full font-bold uppercase tracking-widest transition-all ${hasUnavailableItems
                                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                                : 'bg-stone-900 hover:bg-teal-600 text-white'
                                }`}
                        >
                            {hasUnavailableItems ? 'Remove Unavailable Items' : 'Checkout'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
