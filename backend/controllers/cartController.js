const { Cart, CartItem, Product, ProductVariation } = require('../models').models;
const { Op } = require('sequelize');

const getCart = async (req, res) => {
    try {
        const customer_id = req.user.id;

        let cart = await Cart.findOne({
            where: { customer_id },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'image_url', 'size', 'is_active', 'is_available']
                        },
                        {
                            model: ProductVariation,
                            as: 'variation',
                            attributes: ['id', 'name', 'price', 'is_available']
                        }
                    ]
                }
            ]
        });

        if (!cart) {
            cart = await Cart.create({ customer_id });
            cart.items = [];
        }

        // Format response to match frontend expectation
        const formattedItems = cart.items ? cart.items.map(item => {
            // Use variation price/name if variation exists, otherwise use product
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
                // Include variation info for frontend
                variation_id: item.variation_id,
                selectedVariation: hasVariation ? {
                    id: item.variation.id,
                    name: item.variation.name,
                    price: item.variation.price,
                    is_available: item.variation.is_available
                } : null,
                displaySize: hasVariation ? item.variation.name : item.product.size,
                // Unique cart key for frontend
                cartKey: hasVariation ? `${item.product.id}_${item.variation_id}` : `${item.product.id}`
            };
        }) : [];

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

        let cart = await Cart.findOne({ where: { customer_id } });

        if (!cart) {
            cart = await Cart.create({ customer_id });
        }

        // Build where clause - include variation_id in lookup
        const whereClause = {
            cart_id: cart.id,
            product_id
        };

        // Handle variation_id (null means base product)
        if (variation_id) {
            whereClause.variation_id = variation_id;
        } else {
            whereClause.variation_id = { [Op.is]: null };
        }

        const existingItem = await CartItem.findOne({ where: whereClause });

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
            await existingItem.save();
        } else {
            await CartItem.create({
                cart_id: cart.id,
                product_id,
                variation_id: variation_id || null,
                quantity
            });
        }

        // Return updated cart
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

        const cart = await Cart.findOne({ where: { customer_id } });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Cart not found'
                }
            });
        }

        // Build where clause - include variation_id in lookup
        const whereClause = {
            cart_id: cart.id,
            product_id
        };

        if (variation_id) {
            whereClause.variation_id = variation_id;
        } else {
            whereClause.variation_id = { [Op.is]: null };
        }

        const item = await CartItem.findOne({ where: whereClause });

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
            item.quantity = quantity;
            await item.save();
        } else {
            await item.destroy();
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

        const cart = await Cart.findOne({ where: { customer_id } });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Cart not found'
                }
            });
        }

        // Build where clause
        const whereClause = {
            cart_id: cart.id,
            product_id: actualProductId
        };

        if (variationId) {
            whereClause.variation_id = variationId;
        } else {
            whereClause.variation_id = { [Op.is]: null };
        }

        await CartItem.destroy({ where: whereClause });

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
        const cart = await Cart.findOne({ where: { customer_id } });

        if (cart) {
            await CartItem.destroy({
                where: { cart_id: cart.id }
            });
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
        const { items } = req.body; // Array of cart items with potential variations

        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Items must be an array'
                }
            });
        }

        let cart = await Cart.findOne({ where: { customer_id } });
        if (!cart) {
            cart = await Cart.create({ customer_id });
        }

        for (const item of items) {
            const productId = item.id;
            const variationId = item.selectedVariation?.id || item.variation_id || null;

            // Build where clause
            const whereClause = {
                cart_id: cart.id,
                product_id: productId
            };

            if (variationId) {
                whereClause.variation_id = variationId;
            } else {
                whereClause.variation_id = { [Op.is]: null };
            }

            const existingItem = await CartItem.findOne({ where: whereClause });

            if (existingItem) {
                // Add quantities for sync
                existingItem.quantity += parseInt(item.quantity);
                await existingItem.save();
            } else {
                await CartItem.create({
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

