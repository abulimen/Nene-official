import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { blogService } from '../../services/api';
import { getUploadUrl } from '../../utils/config';

const createSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

export const getPostUrl = (post) => {
    const categorySlug = (post.category || 'journal').toLowerCase().replace(/\s+/g, '-');
    const titleSlug = createSlug(post.title);
    return `/blog/${categorySlug}/${titleSlug}-${post.id}`;
};

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await blogService.getAll();
                const sortedPosts = response.data.data
                    .sort((a, b) => new Date(b.published_at || b.createdAt) - new Date(a.published_at || a.createdAt))
                    .slice(0, 3);
                setPosts(sortedPosts);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full mx-auto"
                />
            </div>
        );
    }

    return (
        <section id="blog" className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-stone-500 text-sm tracking-widest uppercase mb-2 block">Our Journal</span>
                    <h2 className="font-serif text-4xl text-stone-800 mb-4">Latest from Nené</h2>
                    <motion.div
                        className="w-24 h-1 bg-stone-800 mx-auto rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: 96 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    />
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {posts.map((post, index) => (
                        <motion.div key={post.id} variants={cardVariants} custom={index}>
                            <Link to={getPostUrl(post)} className="group cursor-pointer block">
                                <motion.article
                                    whileHover={{ y: -8 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden mb-6 relative">
                                        <motion.img
                                            src={getUploadUrl(post.image_url) || "/api/placeholder/800/600"}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                            whileHover={{ scale: 1.08 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                        <motion.div
                                            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-medium text-stone-800"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                        >
                                            {post.category}
                                        </motion.div>
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
                                        <span className="flex items-center text-stone-800 text-sm font-medium group-hover:gap-3 transition-all gap-1">
                                            Read Article <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </motion.article>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Button */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                        >
                            View All Articles <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Blog;
