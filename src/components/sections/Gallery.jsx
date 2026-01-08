import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Gallery = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 1.1 },
        visible: {
            opacity: 0.8,
            scale: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    const listItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" }
        })
    };

    return (
        <section className="py-32 bg-nene-black text-greek-cream overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-12 gap-16 items-center">

                    {/* Text Content - Spans 5 cols */}
                    <motion.div
                        className="lg:col-span-5 space-y-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="inline-block border-b border-vitality-teal pb-2">
                            <span className="text-vitality-teal uppercase tracking-widest text-xs font-bold">Our Philosophy</span>
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-5xl md:text-6xl font-serif font-bold leading-tight text-greek-cream">
                            Freshness <br />
                            <span className="text-stone-500">you can taste.</span>
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-stone-400 text-lg leading-relaxed font-light">
                            We believe in keeping things simple. Our products are sourced from trusted partners who share our commitment to quality. We process in small batches to ensure texture, taste, and integrity.
                        </motion.p>

                        <motion.div variants={itemVariants} className="pt-8">
                            <ul className="space-y-6">
                                {[
                                    "100% Natural Ingredients",
                                    "Zero Artificial Preservatives",
                                    "Recyclable Packaging",
                                    "Quality Guaranteed"
                                ].map((item, index) => (
                                    <motion.li
                                        key={item}
                                        custom={index}
                                        variants={listItemVariants}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-4 text-stone-300 group cursor-default"
                                    >
                                        <motion.span
                                            whileHover={{ scale: 1.1, backgroundColor: "#56827D" }}
                                            className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center transition-colors"
                                        >
                                            <CheckCircle size={14} className="text-stone-400 group-hover:text-white" />
                                        </motion.span>
                                        <span className="font-medium tracking-wide">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>

                    {/* Image Grid - Spans 7 cols - Asymmetrical */}
                    <motion.div
                        className="lg:col-span-7 relative"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-6 mt-12">
                                <motion.div
                                    variants={imageVariants}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative h-64 w-full overflow-hidden rounded-none"
                                >
                                    <motion.img
                                        src="/images/yogurt-bowl.png"
                                        alt="Premium Yogurt Bowl"
                                        whileHover={{ scale: 1.1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    whileHover={{ borderColor: "#56827D" }}
                                    className="p-6 border border-stone-800 bg-stone-900/50 transition-colors"
                                >
                                    <p className="text-2xl font-serif italic text-biscuit-gold">"The best yogurt I've ever tasted."</p>
                                    <p className="text-stone-500 text-sm mt-4">— Sarah J., Lagos</p>
                                </motion.div>
                            </div>
                            <div className="space-y-6">
                                <motion.div
                                    variants={imageVariants}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative h-96 w-full overflow-hidden rounded-none"
                                >
                                    <motion.img
                                        src="/images/fresh-milk.png"
                                        alt="Fresh Milk"
                                        whileHover={{ scale: 1.1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Gallery;
