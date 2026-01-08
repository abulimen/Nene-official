import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductImage from '../ui/ProductImage';
import { getUploadUrl } from '../../utils/config';

// Generate URL-friendly slug from product name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Get price display info based on variations
const getPriceInfo = (product) => {
    if (!product.variations || product.variations.length === 0) {
        return {
            hasRange: false,
            minPrice: parseFloat(product.price),
            maxPrice: parseFloat(product.price)
        };
    }

    // Get all prices including base price
    const allPrices = [
        parseFloat(product.price),
        ...product.variations.map(v => parseFloat(v.price))
    ];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    return {
        hasRange: minPrice !== maxPrice,
        minPrice,
        maxPrice
    };
};

const ProductCard = ({ product, addToCart, onClick }) => {
    const navigate = useNavigate();
    const productUrl = `/product/${product.id}/${generateSlug(product.name)}`;
    const priceInfo = getPriceInfo(product);
    const hasVariations = product.variations && product.variations.length > 0;

    const handleCardClick = (e) => {
        // Prevent navigation if clicking on a button or link
        if (e.target.closest('button') || e.target.closest('a')) return;

        if (onClick) {
            onClick(product.id);
        } else {
            navigate(productUrl);
        }
    };

    return (
        <motion.div
            onClick={handleCardClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50">
                <motion.div
                    className="w-full h-full"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {product.image_url ? (
                        <img
                            src={getUploadUrl(product.image_url)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <ProductImage
                            type={product.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                </motion.div>

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Action Buttons */}
                <motion.div
                    className="absolute top-4 right-4 flex flex-col gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (product.is_available) {
                                addToCart(product);
                            }
                        }}
                        disabled={!product.is_available}
                        className={`w-11 h-11 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all duration-300 shadow-lg ${product.is_available
                                ? 'bg-white/95 text-stone-800 hover:bg-teal-500 hover:text-white'
                                : 'bg-stone-400/50 text-stone-500 cursor-not-allowed'
                            }`}
                        title={product.is_available ? "Add to Cart" : "Out of Stock"}
                    >
                        <ShoppingCart size={18} strokeWidth={2.5} />
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link
                            to={productUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-xl text-stone-800 hover:bg-stone-900 hover:text-white transition-all duration-300 shadow-lg flex items-center justify-center"
                            title="View Details"
                        >
                            <Eye size={18} strokeWidth={2.5} />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {!product.is_available && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wide shadow-lg"
                        >
                            Sold Out
                        </motion.span>
                    )}
                    {hasVariations && product.is_available && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wide shadow-lg flex items-center gap-1"
                        >
                            <Package size={10} />
                            {product.variations.length + 1} Sizes
                        </motion.span>
                    )}
                </div>

                {/* Out of Stock Overlay */}
                {!product.is_available && (
                    <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-[1px]" />
                )}
            </div>

            {/* Content Section */}
            <div className="p-5">
                {/* Product Name */}
                <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors duration-300">
                    {product.name}
                </h3>

                {/* Description */}
                <p className="text-stone-500 text-sm line-clamp-1 mb-4">
                    {product.description || "Premium artisanal quality"}
                </p>

                {/* Price Section - Redesigned */}
                <div className="flex items-end justify-between">
                    {priceInfo.hasRange ? (
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">
                                Price Range
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-bold text-stone-900">
                                    ₦{priceInfo.minPrice.toLocaleString()}
                                </span>
                                <span className="text-stone-400 text-sm">—</span>
                                <span className="text-lg font-semibold text-stone-600">
                                    ₦{priceInfo.maxPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">
                                Price
                            </span>
                            <span className="text-2xl font-bold text-stone-900">
                                ₦{priceInfo.minPrice.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 bg-stone-100 px-2.5 py-1.5 rounded-xl">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-stone-700">
                            {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
                        </span>
                    </div>
                </div>

                {/* Size & Category Pills */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
                        {product.size}
                    </span>
                    {product.tags && (
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full">
                            {product.tags.split(',')[0].trim()}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
