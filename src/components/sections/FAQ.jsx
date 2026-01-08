import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionTitle from '../ui/SectionTitle';
import { faqService } from '../../services/api';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const response = await faqService.getAll();
                setFaqs(response.data.data || []);
            } catch (error) {
                console.error('Failed to load FAQs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    if (loading) {
        return (
            <section className="py-24 px-6 bg-stone-50">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full mx-auto"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 px-6 bg-stone-50 overflow-hidden" id="faq">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <SectionTitle>Frequently Asked Questions</SectionTitle>
                </motion.div>

                {faqs.length > 0 ? (
                    <motion.div
                        className="space-y-4"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={faq.id}
                                variants={itemVariants}
                                className="bg-white rounded-xl shadow-sm overflow-hidden"
                            >
                                <motion.button
                                    className="w-full p-6 flex justify-between items-center text-left"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                                >
                                    <h4 className="font-bold text-stone-900 pr-4">{faq.question}</h4>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-shrink-0"
                                    >
                                        <ChevronDown size={20} className="text-stone-500" />
                                    </motion.div>
                                </motion.button>

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <motion.p
                                                className="px-6 pb-6 text-stone-600 text-sm leading-relaxed"
                                                initial={{ y: -10 }}
                                                animate={{ y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {faq.answer}
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.p
                        className="text-center text-stone-500 italic"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        No FAQs available at the moment.
                    </motion.p>
                )}
            </div>
        </section>
    );
};

export default FAQ;
