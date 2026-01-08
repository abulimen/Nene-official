import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X, ArrowRight, Calendar, Tag } from 'lucide-react';
import { blogService } from '../services/api';
import { getUploadUrl } from '../utils/config';
import { getPostUrl } from '../components/sections/Blog';

const BlogListing = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await blogService.getAll();
                setPosts(response.data.data);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(posts.map(p => p.category).filter(Boolean))];
        return cats.sort();
    }, [posts]);

    // Filter and sort posts
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt?.toLowerCase().includes(query) ||
                post.category?.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory) {
            result = result.filter(post => post.category === selectedCategory);
        }

        // Sort
        switch (sortBy) {
            case 'oldest':
                result.sort((a, b) => new Date(a.published_at || a.createdAt) - new Date(b.published_at || b.createdAt));
                break;
            case 'title':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.published_at || b.createdAt) - new Date(a.published_at || a.createdAt));
        }

        return result;
    }, [posts, searchQuery, selectedCategory, sortBy]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortBy('newest');
    };

    const hasActiveFilters = searchQuery || selectedCategory || sortBy !== 'newest';

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
                <div className="text-stone-500 tracking-widest uppercase text-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
                <div className="text-center">
                    <span className="text-stone-500 text-sm tracking-widest uppercase mb-2 block">Our Journal</span>
                    <h1 className="font-serif text-5xl text-stone-900 mb-4">Blog & Articles</h1>
                    <p className="text-stone-600 max-w-2xl mx-auto">
                        Explore wellness tips, recipes, and lifestyle articles from the Nené team.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 mb-12">
                <div className="bg-stone-50 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="pl-12 pr-8 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none cursor-pointer min-w-[180px]"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-12 pr-8 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">By Title</option>
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
                        Showing {filteredPosts.length} of {posts.length} articles
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-7xl mx-auto px-4">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-stone-500 text-lg">No articles found matching your criteria.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-stone-900 underline hover:no-underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <Link to={getPostUrl(post)} key={post.id} className="group cursor-pointer block">
                                <article>
                                    <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden mb-6 relative">
                                        <img
                                            src={getUploadUrl(post.image_url) || "/api/placeholder/800/600"}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-medium text-stone-800">
                                            {post.category}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="text-xs text-stone-500">
                                            {new Date(post.published_at || post.createdAt).toLocaleDateString()} • {post.read_time || '5 min read'}
                                        </div>
                                        <h3 className="font-serif text-xl text-stone-800 group-hover:text-stone-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-stone-600 text-sm line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <span className="flex items-center text-stone-800 text-sm font-medium group-hover:gap-2 transition-all">
                                            Read Article <ArrowRight size={16} className="ml-1" />
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogListing;
