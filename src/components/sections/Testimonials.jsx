import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionTitle from '../ui/SectionTitle';
import { productService } from '../../services/api';
import { getUploadUrl } from '../../utils/config';

const Testimonials = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enableCarousel, setEnableCarousel] = useState(false);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    useEffect(() => {
        const fetchFeaturedReviews = async () => {
            try {
                const response = await productService.getFeaturedReviews();
                setReviews(response.data.data);
            } catch (error) {
                console.error('Error fetching featured reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedReviews();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const count = reviews.length;

            if (width < 768) {
                setEnableCarousel(count > 1);
            } else if (width < 1024) {
                setEnableCarousel(count > 2);
            } else {
                setEnableCarousel(count > 3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [reviews.length]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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

    if (loading) return null;
    if (reviews.length === 0) return null;

    return (
        <section className="py-24 px-6 bg-teal-50/50" id="reviews">
            <div className="max-w-7xl mx-auto relative">
                <motion.div
                    className="mb-12 relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionTitle subtitle="Join thousands of happy customers enjoying Nené.">What People Say</SectionTitle>

                    {enableCarousel && (
                        <div className="hidden md:flex gap-2 absolute right-0 top-1/2 -translate-y-1/2">
                            <motion.button
                                onClick={scrollPrev}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-3 rounded-full border border-stone-200 transition-colors ${prevBtnEnabled ? 'bg-white hover:bg-stone-50 text-stone-900' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                                disabled={!prevBtnEnabled}
                            >
                                <ChevronLeft size={20} />
                            </motion.button>
                            <motion.button
                                onClick={scrollNext}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-3 rounded-full border border-stone-200 transition-colors ${nextBtnEnabled ? 'bg-white hover:bg-stone-50 text-stone-900' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                                disabled={!nextBtnEnabled}
                            >
                                <ChevronRight size={20} />
                            </motion.button>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    className="overflow-hidden"
                    ref={enableCarousel ? emblaRef : null}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                >
                    <div className={`flex -ml-8 ${!enableCarousel ? 'justify-center' : ''}`}>
                        {reviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-8"
                                variants={cardVariants}
                                custom={index}
                            >
                                <motion.div
                                    className="bg-white p-8 rounded-2xl shadow-sm relative border border-teal-100 h-full flex flex-col"
                                    whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        initial={{ rotate: 180, opacity: 0.1 }}
                                        whileInView={{ rotate: 180, opacity: 0.3 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <Quote className="absolute top-8 right-8 text-teal-100" size={40} />
                                    </motion.div>

                                    <div className="flex gap-1 text-amber-400 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 0.1 * i }}
                                                viewport={{ once: true }}
                                            >
                                                <Star size={16} fill={i < review.rating ? "currentColor" : "none"} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    <p className="text-stone-700 text-lg italic leading-relaxed mb-8 relative z-10 flex-grow">
                                        "{review.review_text}"
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-stone-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-700"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {review.customer_name.charAt(0)}
                                                </motion.div>
                                                <div>
                                                    <p className="font-bold text-stone-900 text-sm">{review.customer_name}</p>
                                                    <p className="text-xs text-stone-500">Verified Buyer</p>
                                                </div>
                                            </div>

                                            {review.product && (
                                                <Link
                                                    to={`/product/${review.product.id}/${review.product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                                                    className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-teal-600 transition-colors"
                                                >
                                                    <motion.img
                                                        src={getUploadUrl(review.product.image_url)}
                                                        alt={review.product.name}
                                                        className="w-8 h-8 rounded object-cover bg-stone-100"
                                                        whileHover={{ scale: 1.2 }}
                                                    />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Mobile Navigation Dots */}
                {enableCarousel && (
                    <motion.div
                        className="flex justify-center gap-2 mt-8 md:hidden"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {reviews.map((_, index) => (
                            <motion.button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${index === emblaApi?.selectedScrollSnap() ? 'bg-teal-600 w-6' : 'bg-stone-300'}`}
                                onClick={() => emblaApi && emblaApi.scrollTo(index)}
                                whileTap={{ scale: 0.9 }}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;
