import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Linkedin, Link as LinkIcon, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

const Footer = ({ onNavigate }) => {
    const { socialLinks, contactInfo } = useSettings();

    const getIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('facebook')) return Facebook;
        if (p.includes('twitter') || p.includes('x.com')) return Twitter;
        if (p.includes('instagram')) return Instagram;
        if (p.includes('linkedin')) return Linkedin;
        return LinkIcon;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <footer className="bg-nene-black text-greek-cream pt-20 pb-10 px-6 overflow-hidden">
            <motion.div
                className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-20"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                <motion.div variants={itemVariants}>
                    <motion.img
                        src="/nene-white-logo.png"
                        alt="Nené"
                        className="h-8 w-auto mb-6"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    />
                    <p className="text-stone-400 text-sm leading-relaxed mb-6">
                        {contactInfo?.footer_tagline || 'Simple ingredients. Authentic culture. A taste of the good life in every spoon.'}
                    </p>
                    <div className="flex space-x-4">
                        {socialLinks.map((link, index) => {
                            const Icon = getIcon(link.platform);
                            return (
                                <motion.a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-400 hover:text-biscuit-gold transition-colors"
                                    title={link.platform}
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                    <Icon size={24} />
                                </motion.a>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <h4 className="font-bold mb-6 text-biscuit-gold">Shop</h4>
                    <ul className="space-y-4 text-sm text-stone-400">
                        <motion.li
                            className="hover:text-vitality-teal cursor-pointer"
                            whileHover={{ x: 5 }}
                        >
                            <Link to="/products">All Products</Link>
                        </motion.li>
                        <motion.li
                            className="hover:text-vitality-teal cursor-pointer"
                            whileHover={{ x: 5 }}
                        >
                            <a href="/#shop">Featured</a>
                        </motion.li>
                    </ul>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <h4 className="font-bold mb-6 text-biscuit-gold">Support</h4>
                    <ul className="space-y-4 text-sm text-stone-400">
                        <motion.li
                            className="hover:text-vitality-teal cursor-pointer"
                            whileHover={{ x: 5 }}
                        >
                            <a href="/#faq">FAQ</a>
                        </motion.li>
                        <motion.li
                            className="hover:text-vitality-teal cursor-pointer"
                            whileHover={{ x: 5 }}
                        >
                            <Link to="/shipping-policy">Shipping Policy</Link>
                        </motion.li>
                        <motion.li
                            className="hover:text-vitality-teal cursor-pointer"
                            whileHover={{ x: 5 }}
                        >
                            <Link to="/contact">Contact Us</Link>
                        </motion.li>
                    </ul>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <h4 className="font-bold mb-6 text-biscuit-gold">Contact</h4>
                    {contactInfo ? (
                        <ul className="space-y-4 text-sm text-stone-400">
                            {contactInfo.phone && (
                                <motion.li
                                    className="flex items-center gap-3 hover:text-vitality-teal"
                                    whileHover={{ x: 5 }}
                                >
                                    <Phone size={16} className="shrink-0" />
                                    <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                                </motion.li>
                            )}
                            {contactInfo.email && (
                                <motion.li
                                    className="flex items-center gap-3 hover:text-vitality-teal"
                                    whileHover={{ x: 5 }}
                                >
                                    <Mail size={16} className="shrink-0" />
                                    <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                                </motion.li>
                            )}
                            {contactInfo.address && (
                                <li className="flex items-start gap-3">
                                    <MapPin size={16} className="shrink-0 mt-0.5" />
                                    <span>{contactInfo.address}</span>
                                </li>
                            )}
                            {contactInfo.business_hours && (
                                <li className="text-stone-500 text-xs mt-2">
                                    {contactInfo.business_hours}
                                </li>
                            )}
                        </ul>
                    ) : (
                        <p className="text-stone-500 text-sm">Loading...</p>
                    )}
                </motion.div>
            </motion.div>

            <motion.div
                className="text-center text-stone-600 text-xs border-t border-stone-800 pt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
            >
                © 2025 Nené Foods. {contactInfo?.city || 'Nigeria'}. All rights reserved.
            </motion.div>
        </footer>
    );
};

export default Footer;
