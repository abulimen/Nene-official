const { supabase } = require('../utils/supabase');

const getAllProducts = async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                *,
                images:product_images(id, image_url, is_primary, display_order),
                variations:product_variations(id, name, price, sku, is_available, sort_order)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching products'
            }
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .insert(req.body)
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error creating product'
            }
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        const { data: product, error } = await supabase
            .from('products')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating product'
            }
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('id', req.params.id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        // Delete associated data first
        await supabase.from('reviews').delete().eq('product_id', req.params.id);
        await supabase.from('product_images').delete().eq('product_id', req.params.id);
        await supabase.from('product_variations').delete().eq('product_id', req.params.id);

        // Delete the product
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Product and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error deleting product'
            }
        });
    }
};

const addProductImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url, is_primary, display_order } = req.body;

        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .single();

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        const { data: image, error } = await supabase
            .from('product_images')
            .insert({
                product_id: id,
                image_url,
                is_primary: is_primary || false,
                display_order: display_order || 0
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: image
        });
    } catch (error) {
        console.error('Error adding product image:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error adding product image'
            }
        });
    }
};

const deleteProductImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        const { data: image } = await supabase
            .from('product_images')
            .select('id')
            .eq('id', imageId)
            .eq('product_id', id)
            .single();

        if (!image) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Image not found'
                }
            });
        }

        const { error } = await supabase
            .from('product_images')
            .delete()
            .eq('id', imageId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product image:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error deleting product image'
            }
        });
    }
};

// ============= PRODUCT VARIATIONS =============

const createVariation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, sku, is_available, sort_order } = req.body;

        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .single();

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        const { data: variation, error } = await supabase
            .from('product_variations')
            .insert({
                product_id: id,
                name,
                price,
                sku: sku || null,
                is_available: is_available !== undefined ? is_available : true,
                sort_order: sort_order || 0
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: variation
        });
    } catch (error) {
        console.error('Error creating product variation:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error creating product variation'
            }
        });
    }
};

const updateVariation = async (req, res) => {
    try {
        const { id, variationId } = req.params;
        const { name, price, sku, is_available, sort_order } = req.body;

        const { data: existing } = await supabase
            .from('product_variations')
            .select('*')
            .eq('id', variationId)
            .eq('product_id', id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Variation not found'
                }
            });
        }

        const { data: variation, error } = await supabase
            .from('product_variations')
            .update({
                name: name !== undefined ? name : existing.name,
                price: price !== undefined ? price : existing.price,
                sku: sku !== undefined ? sku : existing.sku,
                is_available: is_available !== undefined ? is_available : existing.is_available,
                sort_order: sort_order !== undefined ? sort_order : existing.sort_order
            })
            .eq('id', variationId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: variation
        });
    } catch (error) {
        console.error('Error updating product variation:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating product variation'
            }
        });
    }
};

const deleteVariation = async (req, res) => {
    try {
        const { id, variationId } = req.params;

        const { data: existing } = await supabase
            .from('product_variations')
            .select('id')
            .eq('id', variationId)
            .eq('product_id', id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Variation not found'
                }
            });
        }

        const { error } = await supabase
            .from('product_variations')
            .delete()
            .eq('id', variationId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Variation deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product variation:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error deleting product variation'
            }
        });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductImage,
    deleteProductImage,
    createVariation,
    updateVariation,
    deleteVariation
};
