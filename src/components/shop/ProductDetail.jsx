import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Minus, Plus, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../../services/api';
import { getUploadUrl } from '../../utils/config';

const ProductDetail = ({ addToCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [reviewForm, setReviewForm] = useState({ customer_name: '', rating: 5, review_text: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await productService.submitReview({ product_id: id, ...reviewForm });
            setReviewSuccess(true);
            setReviewForm({ customer_name: '', rating: 5, review_text: '' });
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmittingReview(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, reviewsRes] = await Promise.all([
                    productService.getById(id),
                    productService.getReviews(id)
                ]);
                setProduct(productRes.data.data);
                setReviews(reviewsRes.data.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getCurrentPrice = () => {
        if (selectedVariation) {
            return parseFloat(selectedVariation.price);
        }
        return parseFloat(product?.price || 0);
    };

    const isCurrentSelectionAvailable = () => {
        if (selectedVariation) {
            return selectedVariation.is_available;
        }
        return product?.is_available;
    };

    const handleAddToCart = () => {
        if (product) {
            setIsAdding(true);
            const cartItem = {
                ...product,
                selectedVariation: selectedVariation,
                price: getCurrentPrice(),
                displaySize: selectedVariation ? selectedVariation.name : product.size
            };
            addToCart(cartItem, quantity);
            setTimeout(() => setIsAdding(false), 1000);
        }
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-greek-cream">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-greek-cream">
                <div className="text-stone-600 font-serif text-xl">Product not found</div>
            </div>
        );
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
        : (product.average_rating || 0);

    const reviewCount = reviews.length || product.review_count || 0;

    const allImages = [
        { id: 'main', image_url: product.image_url },
        ...(product.images || [])
    ];

    const tabItems = ['description', 'ingredients', 'nutrition', 'reviews'];

    return (
        <div className="min-h-screen bg-greek-cream overflow-x-hidden">
            {/* Back Button - Fixed */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-32 left-4 z-30"
            >
                <motion.button
                    onClick={() => navigate('/')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-md flex items-center justify-center text-stone-800"
                >
                    <ArrowLeft size={18} />
                </motion.button>
            </motion.div>

            {/* Main Content */}
            <div className="pt-32 pb-8">
                <div className="w-full max-w-6xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row lg:gap-12">

                        {/* Image Section */}
                        <div className="w-full lg:w-1/2 lg:sticky lg:top-24 lg:self-start">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-lg"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={getUploadUrl(allImages[currentImageIndex].image_url)}
                                        alt={product.name}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full object-cover"
                                    />
                                </AnimatePresence>

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {!product.is_available && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                            Sold Out
                                        </span>
                                    )}
                                    {product.tags && (
                                        <span className="bg-white/90 backdrop-blur text-stone-900 text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                                            {product.tags.split(',')[0]}
                                        </span>
                                    )}
                                </div>
                            </motion.div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx
                                                ? 'border-stone-900'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img
                                                src={getUploadUrl(img.image_url)}
                                                alt={`View ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="w-full lg:w-1/2 mt-6 lg:mt-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {/* Rating & Size */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm">
                                        <Star size={12} className="fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-bold text-stone-800">{averageRating}</span>
                                        <span className="text-xs text-stone-400 border-l border-stone-200 pl-2 ml-1">
                                            {reviewCount} reviews
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-stone-500 px-2.5 py-1 bg-stone-100 rounded-full">
                                        {product.size}
                                    </span>
                                </div>

                                {/* Name */}
                                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-stone-900 mb-2 leading-tight">
                                    {product.name}
                                </h1>

                                {/* Tagline */}
                                {product.tagline && (
                                    <p className="text-sm sm:text-base text-stone-500 mb-4">
                                        {product.tagline}
                                    </p>
                                )}

                                {/* Price Card */}
                                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-100 mb-6">
                                    {/* Price */}
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-2xl sm:text-3xl font-bold text-stone-900">
                                            ₦{getCurrentPrice().toLocaleString()}
                                        </span>
                                        {selectedVariation && (
                                            <span className="text-sm text-stone-400">
                                                / {selectedVariation.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Variations */}
                                    {product.variations && product.variations.length > 0 && (
                                        <div className="mb-5">
                                            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 block">
                                                Select Size
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setSelectedVariation(null)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${!selectedVariation
                                                        ? 'border-stone-900 bg-stone-900 text-white'
                                                        : 'border-stone-200 text-stone-600 hover:border-stone-400'
                                                        }`}
                                                >
                                                    {product.size}
                                                </button>
                                                {product.variations
                                                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                                                    .map((variation) => (
                                                        <button
                                                            key={variation.id}
                                                            onClick={() => variation.is_available && setSelectedVariation(variation)}
                                                            disabled={!variation.is_available}
                                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${selectedVariation?.id === variation.id
                                                                ? 'border-stone-900 bg-stone-900 text-white'
                                                                : variation.is_available
                                                                    ? 'border-stone-200 text-stone-600 hover:border-stone-400'
                                                                    : 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed line-through'
                                                                }`}
                                                        >
                                                            {variation.name}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {/* Quantity */}
                                        <div className="flex items-center justify-between bg-stone-100 rounded-xl p-1.5 sm:w-32">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={decrementQuantity}
                                                className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-stone-600"
                                            >
                                                <Minus size={16} />
                                            </motion.button>
                                            <span className="text-lg font-bold text-stone-900">{quantity}</span>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={incrementQuantity}
                                                className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center text-stone-600"
                                            >
                                                <Plus size={16} />
                                            </motion.button>
                                        </div>

                                        {/* Add to Cart */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAddToCart}
                                            disabled={!isCurrentSelectionAvailable()}
                                            className={`flex-1 py-3 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${isCurrentSelectionAvailable()
                                                ? isAdding
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-stone-900 text-white hover:bg-stone-800'
                                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isAdding ? (
                                                <>
                                                    <Check size={20} />
                                                    <span>Added!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart size={20} />
                                                    <span>{isCurrentSelectionAvailable() ? 'Add to Cart' : 'Out of Stock'}</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="border-b border-stone-200 mb-5 overflow-x-auto">
                                    <div className="flex gap-4 min-w-max">
                                        {tabItems.map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                                                    }`}
                                            >
                                                {tab}
                                                {activeTab === tab && (
                                                    <motion.div
                                                        layoutId="activeTab"
                                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="min-h-[120px]"
                                    >
                                        {activeTab === 'description' && (
                                            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                                                {product.description}
                                            </p>
                                        )}

                                        {activeTab === 'ingredients' && (
                                            <div className="bg-white p-4 rounded-xl border border-stone-100">
                                                <p className="text-stone-600 leading-relaxed text-sm whitespace-pre-line">
                                                    {product.ingredients || 'No ingredients information available.'}
                                                </p>
                                            </div>
                                        )}

                                        {activeTab === 'nutrition' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {product.nutrition_info ? (
                                                    Object.entries(product.nutrition_info).map(([key, value]) => (
                                                        <div key={key} className="bg-white p-4 rounded-xl border border-stone-100 text-center">
                                                            <span className="text-xs font-bold text-stone-400 uppercase block mb-1">{key}</span>
                                                            <span className="text-xl font-serif text-stone-900">
                                                                {value}{key !== 'cal' && <span className="text-sm text-stone-500 ml-0.5">g</span>}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-stone-500 text-sm italic col-span-2">No nutrition information available.</p>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'reviews' && (
                                            <div className="space-y-6">
                                                {/* Review Form */}
                                                <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-100">
                                                    <h3 className="font-serif text-lg text-stone-900 mb-4">Write a Review</h3>
                                                    {reviewSuccess ? (
                                                        <div className="bg-green-50 text-green-800 p-3 rounded-lg flex items-center gap-2 text-sm">
                                                            <Check size={18} />
                                                            <span>Thank you! Your review is pending approval.</span>
                                                        </div>
                                                    ) : (
                                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Rating</label>
                                                                <div className="flex gap-1">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <button
                                                                            key={star}
                                                                            type="button"
                                                                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                                            className="focus:outline-none"
                                                                        >
                                                                            <Star
                                                                                size={24}
                                                                                className={star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}
                                                                            />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Name</label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={reviewForm.customer_name}
                                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, customer_name: e.target.value }))}
                                                                    className="w-full px-3 py-2.5 rounded-lg bg-stone-50 border-2 border-transparent focus:border-stone-900 focus:bg-white transition-all outline-none text-sm"
                                                                    placeholder="Your name"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Review</label>
                                                                <textarea
                                                                    required
                                                                    value={reviewForm.review_text}
                                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, review_text: e.target.value }))}
                                                                    className="w-full px-3 py-2.5 rounded-lg bg-stone-50 border-2 border-transparent focus:border-stone-900 focus:bg-white transition-all outline-none h-24 resize-none text-sm"
                                                                    placeholder="Share your thoughts..."
                                                                />
                                                            </div>

                                                            <button
                                                                type="submit"
                                                                disabled={submittingReview}
                                                                className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold text-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
                                                            >
                                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>

                                                {/* Reviews List */}
                                                <div className="space-y-4">
                                                    {reviews.length > 0 ? (
                                                        reviews.map((review) => (
                                                            <div key={review.id} className="bg-white p-4 rounded-xl border border-stone-100">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <h4 className="font-bold text-stone-900 text-sm">{review.customer_name}</h4>
                                                                        <div className="flex text-amber-400 mt-0.5 gap-0.5">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <Star
                                                                                    key={i}
                                                                                    size={12}
                                                                                    className={i < review.rating ? "fill-current" : "text-stone-200 fill-stone-200"}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-xs text-stone-400">
                                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <p className="text-stone-600 text-sm leading-relaxed">{review.review_text}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-stone-200">
                                                            <p className="text-stone-400 text-sm">No reviews yet. Be the first!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
