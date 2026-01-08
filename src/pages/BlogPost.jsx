import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Link as LinkIcon, ArrowLeft, Clock, Calendar, User, Mail, MessageCircle, Send } from 'lucide-react';
import { blogService } from '../services/api';
import { getUploadUrl } from '../utils/config';

// Helper to create URL-friendly slugs
const createSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

const BlogPost = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Extract ID from slug (format: title-slug-{id}) or use direct ID for backward compatibility
    const extractPostId = () => {
        // New format: /blog/:category/:slug where slug ends with -{id}
        if (params.category && params.slug) {
            const parts = params.slug.split('-');
            const lastPart = parts[parts.length - 1];
            return parseInt(lastPart) || null;
        }
        // Old format: /blog/:id (backward compatibility)
        if (params.id) {
            return parseInt(params.id) || null;
        }
        return null;
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await blogService.getAll();
                const postId = extractPostId();
                const foundPost = response.data.data.find(p => p.id === postId);
                setPost(foundPost);
            } catch (err) {
                console.error('Error fetching blog post:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [params]);


    // Share functionality
    const getShareUrl = () => {
        if (!post) return window.location.href;
        const categorySlug = (post.category || 'journal').toLowerCase().replace(/\s+/g, '-');
        const titleSlug = createSlug(post.title);
        return `${window.location.origin}/blog/${categorySlug}/${titleSlug}-${post.id}`;
    };

    const shareHandlers = {
        twitter: () => {
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(getShareUrl())}`;
            window.open(url, '_blank', 'width=600,height=400');
        },
        facebook: () => {
            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
            window.open(url, '_blank', 'width=600,height=400');
        },
        linkedin: () => {
            const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
            window.open(url, '_blank', 'width=600,height=400');
        },
        whatsapp: () => {
            const url = `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + getShareUrl())}`;
            window.open(url, '_blank');
        },
        email: () => {
            const subject = encodeURIComponent(post.title);
            const body = encodeURIComponent(`Check out this article: ${post.title}\n\n${getShareUrl()}`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        },
        telegram: () => {
            const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(post.title)}`;
            window.open(url, '_blank');
        },
        copyLink: async () => {
            try {
                await navigator.clipboard.writeText(getShareUrl());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-stone-500 tracking-widest uppercase text-sm">Loading...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <div className="text-stone-900 font-serif text-2xl">Post not found</div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Home
                </button>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-white pb-20 pt-32">
            {/* Navigation / Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            {/* Article Header */}
            <header className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
                <div className="inline-block bg-stone-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 mb-6">
                    {post.category || 'Journal'}
                </div>
                <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-8">
                    {post.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-sm text-stone-500 border-t border-b border-stone-100 py-4 max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                        <User size={16} />
                        <span className="font-medium text-stone-900">{post.author || 'Nené Editorial'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(post.published_at || post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{post.read_time || '5 min read'}</span>
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            <div className="max-w-7xl mx-auto px-4 mb-16">
                <div className="aspect-[21/9] bg-stone-100 overflow-hidden rounded-sm">
                    <img
                        src={getUploadUrl(post.image_url) || "/api/placeholder/1200/600"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                {post.image_caption && (
                    <div className="text-center text-xs text-stone-400 mt-3 italic">
                        {post.image_caption}
                    </div>
                )}
            </div>

            {/* Content Layout */}
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-12">
                {/* Left Sidebar - Share (Sticky) */}
                <div className="hidden md:block w-48 flex-shrink-0">
                    <div className="sticky top-32 flex flex-col gap-3 items-center">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400 mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                            Share Article
                        </span>
                        <button
                            onClick={shareHandlers.twitter}
                            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-all"
                            title="Share on X (Twitter)"
                        >
                            <Twitter size={18} />
                        </button>
                        <button
                            onClick={shareHandlers.facebook}
                            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all"
                            title="Share on Facebook"
                        >
                            <Facebook size={18} />
                        </button>
                        <button
                            onClick={shareHandlers.linkedin}
                            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all"
                            title="Share on LinkedIn"
                        >
                            <Linkedin size={18} />
                        </button>
                        <button
                            onClick={shareHandlers.whatsapp}
                            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all"
                            title="Share on WhatsApp"
                        >
                            <MessageCircle size={18} />
                        </button>
                        <button
                            onClick={shareHandlers.telegram}
                            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-white hover:bg-[#0088cc] hover:border-[#0088cc] transition-all"
                            title="Share on Telegram"
                        >
                            <Send size={18} />
                        </button>
                        <button
                            onClick={shareHandlers.email}
                            className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 hover:border-stone-700 transition-all"
                            title="Share via Email"
                        >
                            <Mail size={18} />
                        </button>
                        <button
                            onClick={shareHandlers.copyLink}
                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${copied
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900'
                                }`}
                            title={copied ? 'Copied!' : 'Copy link'}
                        >
                            <LinkIcon size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 max-w-3xl mx-auto">
                    {/* Excerpt */}
                    <div className="text-xl md:text-2xl font-serif text-stone-800 leading-relaxed mb-12 border-l-4 border-stone-900 pl-6 italic">
                        {post.excerpt}
                    </div>

                    {/* Rich Text Content */}
                    <div
                        className="prose prose-stone prose-lg max-w-none 
                        prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900 
                        prose-p:text-stone-600 prose-p:leading-loose
                        prose-a:text-stone-900 prose-a:underline prose-a:decoration-stone-300 prose-a:underline-offset-4 hover:prose-a:decoration-stone-900
                        prose-img:rounded-sm prose-img:shadow-sm
                        prose-blockquote:border-l-2 prose-blockquote:border-stone-900 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-stone-800"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags / Footer of Article */}
                    <div className="mt-16 pt-8 border-t border-stone-100 flex flex-wrap gap-2">
                        {[post.category, 'Wellness', 'Nené'].filter(Boolean).map(tag => (
                            <span key={tag} className="px-3 py-1 bg-stone-50 text-stone-500 text-xs uppercase tracking-wider rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Mobile Share Bar */}
                    <div className="md:hidden mt-12 pt-8 border-t border-stone-100">
                        <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-4">Share this article</p>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={shareHandlers.twitter}
                                className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white"
                            >
                                <Twitter size={20} />
                            </button>
                            <button
                                onClick={shareHandlers.facebook}
                                className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white"
                            >
                                <Facebook size={20} />
                            </button>
                            <button
                                onClick={shareHandlers.whatsapp}
                                className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white"
                            >
                                <MessageCircle size={20} />
                            </button>
                            <button
                                onClick={shareHandlers.telegram}
                                className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center text-white"
                            >
                                <Send size={20} />
                            </button>
                            <button
                                onClick={shareHandlers.copyLink}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${copied ? 'bg-green-500' : 'bg-stone-700'}`}
                            >
                                <LinkIcon size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Empty or Read Next (Optional) */}
                <div className="hidden lg:block w-48 flex-shrink-0">
                    {/* Could put "Read Next" here or keep it empty for the "Codex" whitespace look */}
                </div>
            </div>
        </article>
    );
};

export default BlogPost;

