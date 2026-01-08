import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useCustomerAuth } from './CustomerAuthContext';
import { getApiBaseUrl } from '../utils/config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { isAuthenticated, user } = useCustomerAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load cart on mount or auth change
    useEffect(() => {
        if (isAuthenticated) {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (localCart.length > 0) {
                // If we have local items, sync them first (syncCart will fetch remote after)
                syncCart(localCart);
            } else {
                // Otherwise just fetch remote
                fetchRemoteCart();
            }
        } else {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        }
    }, [isAuthenticated]);

    // Sync cart items with latest product data from database
    const syncCartWithDatabase = async () => {
        if (cartItems.length === 0) return;

        try {
            const { productService } = await import('../services/api');
            const updatedItems = await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        const response = await productService.getById(item.id);
                        const latestProduct = response.data.data;

                        // If item has a selected variation, find it in the latest product data
                        if (item.selectedVariation && latestProduct.variations) {
                            const latestVariation = latestProduct.variations.find(
                                v => v.id === item.selectedVariation.id
                            );
                            if (latestVariation) {
                                return {
                                    ...item,
                                    is_active: latestProduct.is_active,
                                    is_available: latestVariation.is_available,
                                    price: latestVariation.price,
                                    name: latestProduct.name,
                                    image_url: latestProduct.image_url,
                                    selectedVariation: latestVariation
                                };
                            }
                        }

                        // No variation - use base product price
                        return {
                            ...item,
                            is_active: latestProduct.is_active,
                            is_available: latestProduct.is_available,
                            price: item.selectedVariation ? item.price : latestProduct.price,
                            name: latestProduct.name,
                            image_url: latestProduct.image_url
                        };
                    } catch (error) {
                        // If product can't be fetched, mark as inactive
                        console.error(`Failed to fetch product ${item.id}:`, error);
                        return {
                            ...item,
                            is_active: false
                        };
                    }
                })
            );

            setCartItems(updatedItems);

            // Save to localStorage if not authenticated
            if (!isAuthenticated) {
                localStorage.setItem('cart', JSON.stringify(updatedItems));
            }
        } catch (error) {
            console.error('Error syncing cart with database:', error);
        }
    };

    // Save to local storage when cart changes (if not authenticated)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isAuthenticated]);

    const fetchRemoteCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('customer_token');
            const response = await axios.get(`${getApiBaseUrl()}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(response.data.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const syncCart = async (localItems) => {
        try {
            const token = localStorage.getItem('customer_token');
            await axios.post(`${getApiBaseUrl()}/cart/sync`,
                { items: localItems },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRemoteCart();
            localStorage.removeItem('cart');
        } catch (error) {
            console.error('Failed to sync cart:', error);
        }
    };

    // Generate unique cart item key (product + variation combo)
    const getCartItemKey = (product) => {
        if (product.selectedVariation) {
            return `${product.id}_${product.selectedVariation.id}`;
        }
        return `${product.id}`;
    };

    const addToCart = async (product, quantity = 1) => {
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('customer_token');
                await axios.post(`${getApiBaseUrl()}/cart/add`,
                    {
                        product_id: product.id,
                        quantity,
                        variation_id: product.selectedVariation?.id || null
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                // Wait for the cart to be fetched before opening
                await fetchRemoteCart();
                setCartOpen(true);
            } catch (error) {
                console.error('Failed to add to cart:', error);
            }
        } else {
            setCartItems(prev => {
                const cartKey = getCartItemKey(product);
                const existing = prev.find(item => getCartItemKey(item) === cartKey);
                let newCart;
                if (existing) {
                    newCart = prev.map(item =>
                        getCartItemKey(item) === cartKey
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    // Store the cart item with a unique cartKey for reference
                    newCart = [...prev, {
                        ...product,
                        quantity,
                        cartKey // Store the key for easier lookup
                    }];
                }
                return newCart;
            });
            setCartOpen(true);
        }
    };

    const removeFromCart = async (cartKey) => {
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('customer_token');
                // For authenticated users, cartKey might be cart item ID from server
                await axios.delete(`${getApiBaseUrl()}/cart/remove/${cartKey}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchRemoteCart();
            } catch (error) {
                console.error('Failed to remove from cart:', error);
            }
        } else {
            // For guests, filter by cartKey or id
            setCartItems(prev => prev.filter(item => {
                const itemKey = item.cartKey || getCartItemKey(item);
                return itemKey !== cartKey && item.id !== cartKey;
            }));
        }
    };

    const updateQuantity = async (cartKey, delta) => {
        if (isAuthenticated) {
            try {
                const item = cartItems.find(i => i.id === cartKey || i.cartKey === cartKey);
                if (!item) return;

                const newQuantity = Math.max(1, item.quantity + delta);
                const token = localStorage.getItem('customer_token');

                await axios.put(`${getApiBaseUrl()}/cart/update`,
                    {
                        product_id: item.id || item.product_id,
                        quantity: newQuantity,
                        variation_id: item.selectedVariation?.id || item.variation_id || null
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchRemoteCart();
            } catch (error) {
                console.error('Failed to update quantity:', error);
            }
        } else {
            setCartItems(prev => prev.map(item => {
                const itemKey = item.cartKey || getCartItemKey(item);
                if (itemKey === cartKey || item.id === cartKey) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }));
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem('customer_token');
                await axios.delete(`${getApiBaseUrl()}/cart/clear`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCartItems([]);
            } catch (error) {
                console.error('Failed to clear cart:', error);
            }
        } else {
            setCartItems([]);
        }
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartOpen,
            setCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            syncCartWithDatabase,
            cartTotal,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};
