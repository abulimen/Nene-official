import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, Tag } from 'lucide-react';
import { productService } from '../services/api';
import ProductCard from '../components/shop/ProductCard';
import { useCart } from '../context/CartContext';

const Products = ({ onOpenCart }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState('all');
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getAll();
                const productsData = response.data.data;

                // Fetch reviews for each product
                const productsWithReviews = await Promise.all(
                    productsData.map(async (product) => {
                        try {
                            const reviewsResponse = await productService.getReviews(product.id);
                            const reviews = reviewsResponse.data.data || [];
                            const avgRating = reviews.length > 0
                                ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                                : 0;
                            return {
                                ...product,
                                reviewCount: reviews.length,
                                averageRating: avgRating
                            };
                        } catch (err) {
                            // If reviews fail, just return product without review data
                            return { ...product, reviewCount: 0, averageRating: 0 };
                        }
                    })
                );

                setProducts(productsWithReviews);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Extract unique tags
    const tags = useMemo(() => {
        const allTags = products
            .map(p => p.tags?.split(',').map(t => t.trim()))
            .flat()
            .filter(Boolean);
        return [...new Set(allTags)].sort();
    }, [products]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.tags?.toLowerCase().includes(query)
            );
        }

        // Tag filter
        if (selectedTag) {
            result = result.filter(product =>
                product.tags?.toLowerCase().includes(selectedTag.toLowerCase())
            );
        }

        // Price range filter
        switch (priceRange) {
            case 'under2500':
                result = result.filter(p => parseFloat(p.price) < 2500);
                break;
            case '2500-4000':
                result = result.filter(p => parseFloat(p.price) >= 2500 && parseFloat(p.price) <= 4000);
                break;
            case 'over4000':
                result = result.filter(p => parseFloat(p.price) > 4000);
                break;
        }

        // Sort
        switch (sortBy) {
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price-low':
                result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    }, [products, searchQuery, selectedTag, sortBy, priceRange]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTag('');
        setSortBy('newest');
        setPriceRange('all');
    };

    const hasActiveFilters = searchQuery || selectedTag || sortBy !== 'newest' || priceRange !== 'all';

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-nene-black font-serif mb-6">
                        Our <span className="text-vitality-teal italic">Collection.</span>
                    </h1>
                    <p className="text-stone-500 max-w-2xl mx-auto text-lg font-light">
                        Explore our full range of artisanal dairy delights, from our signature Greek yogurts to decadent parfaits and treats.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-stone-50 rounded-2xl p-6 mb-12">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                            />
                        </div>

                        {/* Tag Filter */}
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="pl-12 pr-8 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="">All Tags</option>
                                {tags.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="relative">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="pl-12 pr-8 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="all">All Prices</option>
                                <option value="under2500">Under ₦2,500</option>
                                <option value="2500-4000">₦2,500 - ₦4,000</option>
                                <option value="over4000">Over ₦4,000</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-12 pr-8 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name A-Z</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-3 text-stone-600 hover:text-stone-900 transition-colors"
                            >
                                <X size={18} /> Clear
                            </button>
                        )}
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-stone-500">
                        Showing {filteredProducts.length} of {products.length} products
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vitality-teal"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-12">{error}</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-stone-500 text-lg">No products found matching your criteria.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-stone-900 underline hover:no-underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                addToCart={addToCart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;

