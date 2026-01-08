const { Product, ProductImage, Review, ProductVariation } = require('../models').models;

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'is_primary', 'display_order']
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    attributes: ['id', 'name', 'price', 'sku', 'is_available', 'sort_order']
                }
            ],
            order: [['created_at', 'DESC']]
        });

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
        const product = await Product.create(req.body);
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
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        await product.update(req.body);

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
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        // Delete all reviews for this product
        await Review.destroy({
            where: { product_id: req.params.id }
        });

        // Delete all product images
        await ProductImage.destroy({
            where: { product_id: req.params.id }
        });

        // Delete all product variations
        await ProductVariation.destroy({
            where: { product_id: req.params.id }
        });

        // Hard delete the product (foreign key now SET NULL, so order history preserved)
        await product.destroy();

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

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        const image = await ProductImage.create({
            product_id: id,
            image_url,
            is_primary: is_primary || false,
            display_order: display_order || 0
        });

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

        const image = await ProductImage.findOne({
            where: {
                id: imageId,
                product_id: id
            }
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Image not found'
                }
            });
        }

        await image.destroy();

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

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }

        const variation = await ProductVariation.create({
            product_id: id,
            name,
            price,
            sku: sku || null,
            is_available: is_available !== undefined ? is_available : true,
            sort_order: sort_order || 0
        });

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

        const variation = await ProductVariation.findOne({
            where: {
                id: variationId,
                product_id: id
            }
        });

        if (!variation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Variation not found'
                }
            });
        }

        await variation.update({
            name: name !== undefined ? name : variation.name,
            price: price !== undefined ? price : variation.price,
            sku: sku !== undefined ? sku : variation.sku,
            is_available: is_available !== undefined ? is_available : variation.is_available,
            sort_order: sort_order !== undefined ? sort_order : variation.sort_order
        });

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

        const variation = await ProductVariation.findOne({
            where: {
                id: variationId,
                product_id: id
            }
        });

        if (!variation) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Variation not found'
                }
            });
        }

        await variation.destroy();

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
