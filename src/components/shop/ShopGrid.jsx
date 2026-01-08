import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../../services/api';
import ProductCard from './ProductCard';

const ShopGrid = ({ addToCart }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getAll();
                const productsData = response.data.data;

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
                            return { ...product, reviewCount: 0, averageRating: 0 };
                        }
                    })
                );

                const sortedProducts = productsWithReviews
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 6);

                setProducts(sortedProducts);
            } catch (err) {
                setError('Failed to load products');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full mx-auto"
                />
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="text-center py-12 text-red-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {error}
            </motion.div>
        );
    }

    return (
        <div>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <ProductCard
                            product={product}
                            addToCart={addToCart}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* View All Button */}
            <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                    >
                        View All Products <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ShopGrid;
