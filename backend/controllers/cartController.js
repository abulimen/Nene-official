const { supabase } = require('../utils/supabase');

// Helper function to get cart with items
const getCartWithItems = async (customer_id) => {
    // Find or create cart
    let { data: cart, error } = await supabase
        .from('carts')
        .select('id')
        .eq('customer_id', customer_id)
        .single();

    if (!cart) {
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert({ customer_id })
            .select()
            .single();
        if (createError) throw createError;
        cart = newCart;
    }

    // Get cart items with product and variation info
    const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
            id,
            product_id,
            variation_id,
            quantity,
            product:products(id, name, price, image_url, size, is_active, is_available),
            variation:product_variations(id, name, price, is_available)
        `)
        .eq('cart_id', cart.id);

    if (itemsError) throw itemsError;

    return { cart, items: items || [] };
};

const getCart = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { cart, items } = await getCartWithItems(customer_id);

        // Format response to match frontend expectation
        const formattedItems = items.map(item => {
            const hasVariation = item.variation && item.variation_id;
            return {
                id: item.product.id,
                name: item.product.name,
                price: hasVariation ? item.variation.price : item.product.price,
                image_url: item.product.image_url,
                size: item.product.size,
                is_active: item.product.is_active,
                is_available: hasVariation ? item.variation.is_available : item.product.is_available,
                quantity: item.quantity,
                cart_item_id: item.id,
                variation_id: item.variation_id,
                selectedVariation: hasVariation ? {
                    id: item.variation.id,
                    name: item.variation.name,
                    price: item.variation.price,
                    is_available: item.variation.is_available
                } : null,
                displaySize: hasVariation ? item.variation.name : item.product.size,
                cartKey: hasVariation ? `${item.product.id}_${item.variation_id}` : `${item.product.id}`
            };
        });

        res.json({
            success: true,
            data: formattedItems
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching cart'
            }
        });
    }
};

const addToCart = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { product_id, quantity, variation_id } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Product ID and quantity are required'
                }
            });
        }

        // Get or create cart
        let { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', customer_id)
            .single();

        if (!cart) {
            const { data: newCart } = await supabase
                .from('carts')
                .insert({ customer_id })
                .select()
                .single();
            cart = newCart;
        }

        // Check for existing item
        let query = supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('product_id', product_id);

        if (variation_id) {
            query = query.eq('variation_id', variation_id);
        } else {
            query = query.is('variation_id', null);
        }

        const { data: existingItems } = await query;
        const existingItem = existingItems?.[0];

        if (existingItem) {
            await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + parseInt(quantity) })
                .eq('id', existingItem.id);
        } else {
            await supabase
                .from('cart_items')
                .insert({
                    cart_id: cart.id,
                    product_id,
                    variation_id: variation_id || null,
                    quantity
                });
        }

        return getCart(req, res);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error adding to cart'
            }
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { product_id, quantity, variation_id } = req.body;

        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', customer_id)
            .single();

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Cart not found'
                }
            });
        }

        // Find item
        let query = supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('product_id', product_id);

        if (variation_id) {
            query = query.eq('variation_id', variation_id);
        } else {
            query = query.is('variation_id', null);
        }

        const { data: items } = await query;
        const item = items?.[0];

        if (!item) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Item not found in cart'
                }
            });
        }

        if (quantity > 0) {
            await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', item.id);
        } else {
            await supabase
                .from('cart_items')
                .delete()
                .eq('id', item.id);
        }

        return getCart(req, res);
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating cart item'
            }
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { product_id } = req.params;

        // Check if product_id contains variation info (format: productId_variationId)
        let actualProductId = product_id;
        let variationId = null;

        if (product_id.includes('_')) {
            const parts = product_id.split('_');
            actualProductId = parts[0];
            variationId = parts[1];
        }

        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', customer_id)
            .single();

        if (!cart) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Cart not found'
                }
            });
        }

        // Delete item
        let deleteQuery = supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
            .eq('product_id', actualProductId);

        if (variationId) {
            deleteQuery = deleteQuery.eq('variation_id', variationId);
        } else {
            deleteQuery = deleteQuery.is('variation_id', null);
        }

        await deleteQuery;

        return getCart(req, res);
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error removing from cart'
            }
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', customer_id)
            .single();

        if (cart) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('cart_id', cart.id);
        }

        res.json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error clearing cart'
            }
        });
    }
};

const syncCart = async (req, res) => {
    try {
        const customer_id = req.user.id;
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Items must be an array'
                }
            });
        }

        // Get or create cart
        let { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', customer_id)
            .single();

        if (!cart) {
            const { data: newCart } = await supabase
                .from('carts')
                .insert({ customer_id })
                .select()
                .single();
            cart = newCart;
        }

        for (const item of items) {
            const productId = item.id;
            const variationId = item.selectedVariation?.id || item.variation_id || null;

            // Find existing item
            let query = supabase
                .from('cart_items')
                .select('*')
                .eq('cart_id', cart.id)
                .eq('product_id', productId);

            if (variationId) {
                query = query.eq('variation_id', variationId);
            } else {
                query = query.is('variation_id', null);
            }

            const { data: existingItems } = await query;
            const existingItem = existingItems?.[0];

            if (existingItem) {
                await supabase
                    .from('cart_items')
                    .update({ quantity: existingItem.quantity + parseInt(item.quantity) })
                    .eq('id', existingItem.id);
            } else {
                await supabase
                    .from('cart_items')
                    .insert({
                        cart_id: cart.id,
                        product_id: productId,
                        variation_id: variationId,
                        quantity: item.quantity
                    });
            }
        }

        return getCart(req, res);
    } catch (error) {
        console.error('Sync cart error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error syncing cart'
            }
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart
};
