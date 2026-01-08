import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { settingsService } from '../../services/api';

const DeliveryInfo = () => {
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await settingsService.getShippingStates();
                setStates(response.data.data || []);
            } catch (error) {
                console.error('Failed to load shipping states:', error);
                setStates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStates();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.3 }
        }
    };

    const tagVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    if (loading) {
        return (
            <section className="py-16 px-6 bg-white border-y border-stone-100">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-6 bg-white border-y border-stone-100 overflow-hidden">
            <motion.div
                className="max-w-4xl mx-auto text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "backOut" }}
                >
                    <Truck size={48} className="mx-auto text-teal-600 mb-6" />
                </motion.div>

                <motion.h2
                    className="text-3xl font-bold text-stone-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Nationwide Delivery
                </motion.h2>

                <motion.p
                    className="text-stone-600 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    We currently deliver to the following states via our refrigerated logistics partners.
                    Orders placed before 12 PM are processed same-day.
                </motion.p>

                {states.length > 0 ? (
                    <motion.div
                        className="flex flex-wrap justify-center gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {states.map(stateData => (
                            <motion.span
                                key={stateData.id}
                                variants={tagVariants}
                                whileHover={{
                                    scale: 1.05,
                                    borderColor: "#5eead4",
                                    backgroundColor: "#f0fdfa",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-stone-50 rounded-lg text-stone-700 font-medium shadow-sm border border-stone-200 cursor-default"
                            >
                                {stateData.state_name}
                            </motion.span>
                        ))}
                    </motion.div>
                ) : (
                    <motion.p
                        className="text-stone-500 italic"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Delivery information will be updated soon.
                    </motion.p>
                )}
            </motion.div>
        </section>
    );
};

export default DeliveryInfo;
