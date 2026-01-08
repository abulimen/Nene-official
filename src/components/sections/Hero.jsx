import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductImage from '../ui/ProductImage';
import { useSettings } from '../../context/SettingsContext';

// Floating food-themed elements component
const FloatingElements = () => {
    // Different organic shapes representing healthy food elements
    const elements = [
        // Leaf shapes (green teal tones)
        { id: 1, type: 'leaf', x: '10%', y: '20%', size: 40, delay: 0, duration: 8 },
        { id: 2, type: 'leaf', x: '85%', y: '35%', size: 30, delay: 1.5, duration: 10 },
        { id: 3, type: 'leaf', x: '75%', y: '70%', size: 25, delay: 3, duration: 9 },
        // Berry/fruit circles
        { id: 4, type: 'berry', x: '15%', y: '65%', size: 12, delay: 0.5, duration: 7 },
        { id: 5, type: 'berry', x: '90%', y: '15%', size: 10, delay: 2, duration: 8 },
        { id: 6, type: 'berry', x: '5%', y: '45%', size: 8, delay: 4, duration: 6 },
        // Milk/yogurt drops
        { id: 7, type: 'drop', x: '25%', y: '80%', size: 15, delay: 1, duration: 9 },
        { id: 8, type: 'drop', x: '80%', y: '55%', size: 12, delay: 2.5, duration: 7 },
        { id: 9, type: 'drop', x: '60%', y: '10%', size: 10, delay: 0, duration: 11 },
        // Grain/seed dots
        { id: 10, type: 'seed', x: '35%', y: '15%', size: 6, delay: 3.5, duration: 8 },
        { id: 11, type: 'seed', x: '70%', y: '85%', size: 5, delay: 1.2, duration: 10 },
        { id: 12, type: 'seed', x: '50%', y: '40%', size: 4, delay: 2.8, duration: 7 },
    ];

    const getElementStyle = (type) => {
        switch (type) {
            case 'leaf':
                return 'bg-vitality-teal/20 rounded-[40%_60%_70%_30%/40%_50%_50%_60%]';
            case 'berry':
                return 'bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full';
            case 'drop':
                return 'bg-greek-cream/10 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]';
            case 'seed':
                return 'bg-biscuit-gold/30 rounded-full';
            default:
                return 'bg-white/10 rounded-full';
        }
    };

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className={`absolute ${getElementStyle(el.type)}`}
                    style={{
                        left: el.x,
                        top: el.y,
                        width: el.size,
                        height: el.size,
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1],
                        y: [0, -20, 0],
                        rotate: el.type === 'leaf' ? [0, 10, -10, 0] : 0,
                    }}
                    transition={{
                        duration: el.duration,
                        delay: el.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Floating sparkle particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-1 h-1 bg-white/40 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        delay: Math.random() * 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// Animated wavy line separator
const WavyLine = ({ className }) => (
    <svg
        className={`absolute pointer-events-none ${className}`}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
    >
        <motion.path
            d="M0,60 C150,90 300,30 450,60 C600,90 750,30 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z"
            fill="url(#wave-gradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeOut" }}
        />
        <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#56827D" />
                <stop offset="50%" stopColor="#DBCBAA" />
                <stop offset="100%" stopColor="#56827D" />
            </linearGradient>
        </defs>
    </svg>
);

const Hero = ({ onShopNow }) => {
    const { contactInfo } = useSettings();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
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
        hidden: { opacity: 0, scale: 0.8, rotate: -5 },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }
        }
    };

    const circleVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: {
            opacity: 0.5,
            scale: 1,
            transition: { duration: 1, ease: "easeOut", delay: 0.5 }
        }
    };

    return (
        <section className="relative min-h-screen w-full flex items-center bg-nene-black overflow-hidden pt-32 md:pt-20">
            {/* Animated Background Elements */}
            <FloatingElements />

            {/* Gradient Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-vitality-teal/10 rounded-full blur-[120px]"
                />
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-biscuit-gold/5 rounded-full blur-[100px]"
                />
                {/* Additional subtle gradient */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-vitality-teal/5 rounded-full blur-[150px]"
                />
            </div>

            {/* Wavy bottom decoration */}
            <WavyLine className="bottom-0 left-0 w-full h-24" />

            <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10 h-full">

                {/* Text Content - Spans 7 cols */}
                <motion.div
                    className="lg:col-span-7 flex flex-col justify-center space-y-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="flex items-center gap-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 48 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="h-[1px] bg-biscuit-gold"
                        />
                        <span className="text-biscuit-gold uppercase tracking-[0.3em] text-xs font-bold">Est. 2025 • {contactInfo?.city || 'Nigeria'}</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-6xl md:text-8xl lg:text-9xl font-bold text-greek-cream leading-[0.9] tracking-tighter font-serif"
                    >
                        Pure <br />
                        <motion.span
                            className="italic text-vitality-teal font-light inline-block"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            Delight.
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-stone-400 text-lg md:text-xl max-w-lg leading-relaxed font-light border-l-2 border-stone-800 pl-6"
                    >
                        {contactInfo?.hero_subtitle || 'Experience the richness of authentic artisanal dairy. From creamy Greek yogurt to decadent parfaits and treats.'}
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap gap-6 pt-4">
                        <motion.button
                            onClick={() => window.location.href = '/products'}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative px-8 py-4 bg-greek-cream text-nene-black overflow-hidden rounded-none transition-all hover:pr-12"
                        >
                            <span className="relative z-10 font-bold tracking-widest uppercase text-sm">Shop Collection</span>
                            <motion.span
                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                initial={{ opacity: 0, x: -10 }}
                                whileHover={{ opacity: 1, x: 0 }}
                            >
                                <ArrowRight size={16} />
                            </motion.span>
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                const element = document.getElementById('about');
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                                else window.location.href = '/#blog';
                            }}
                            whileHover={{ scale: 1.02, borderColor: '#56827D' }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 border border-stone-800 text-white hover:text-vitality-teal transition-colors font-bold tracking-widest uppercase text-sm"
                        >
                            Our Story
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Hero Image - Spans 5 cols */}
                <motion.div
                    className="lg:col-span-5 relative h-[400px] md:h-[600px] flex items-center justify-center -mt-20 md:mt-0"
                    initial="hidden"
                    animate="visible"
                >
                    <div className="relative w-full h-full flex justify-center items-center">
                        {/* Main Hero Product */}
                        <motion.div
                            className="relative z-20"
                            variants={imageVariants}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <ProductImage type="Hero Image" className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[700px] lg:h-[700px] xl:w-[800px] xl:h-[800px] object-contain drop-shadow-2xl animate-float" />
                        </motion.div>

                        {/* Decorative Circles */}
                        <motion.div
                            variants={circleVariants}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-stone-800 rounded-full z-0"
                        />
                        <motion.div
                            variants={circleVariants}
                            transition={{ delay: 0.7 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-stone-800/50 rounded-full z-0 opacity-30"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] uppercase tracking-widest text-white">Scroll</span>
                <motion.div
                    animate={{ height: [48, 36, 48] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[1px] bg-gradient-to-b from-white to-transparent"
                />
            </motion.div>
        </section>
    );
};

export default Hero;
