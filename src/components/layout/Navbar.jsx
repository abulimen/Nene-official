import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, Instagram, Twitter, Facebook, Linkedin, Link as LinkIcon, Phone, Mail, MapPin } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useSettings } from '../../context/SettingsContext';

const Navbar = ({ cartCount, onOpenCart }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useCustomerAuth();
    const { socialLinks, contactInfo } = useSettings();

    const getIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('facebook')) return Facebook;
        if (p.includes('twitter') || p.includes('x.com')) return Twitter;
        if (p.includes('instagram')) return Instagram;
        if (p.includes('linkedin')) return Linkedin;
        return LinkIcon;
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle hash scrolling when location changes
    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const handleNavClick = (e, path) => {
        // If it's a hash link
        if (path.includes('#')) {
            const [pathname, hash] = path.split('#');
            // If we are not on the home page, let the Link component handle navigation to /
            if (location.pathname !== '/') {
                return; // Allow default Link behavior
            }
            // If we are on home page, prevent default and scroll
            e.preventDefault();
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
            }
        } else {
            setMobileMenuOpen(false);
        }
    };

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/products' },
        { name: 'Blog', path: '/blog' },
        { name: 'Reviews', path: '/#reviews' },
        { name: 'FAQ', path: '/#faq' },
        { name: 'Shipping', path: '/shipping-policy' },
    ];

    const isHomePage = location.pathname === '/';
    const showSolidNav = scrolled || !isHomePage;

    return (
        <>
            <nav className={`fixed w-full z-50 transition-all duration-500 ${showSolidNav ? 'bg-greek-cream/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center md:grid md:grid-cols-3">
                    {/* Left Nav */}
                    <div className="hidden md:flex items-center gap-8 justify-start">
                        {navItems.slice(0, 3).map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={(e) => handleNavClick(e, item.path)}
                                className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${showSolidNav ? 'text-nene-black hover:text-vitality-teal' : 'text-white/80 hover:text-white'}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Center Logo */}
                    <div className="flex justify-center md:justify-center">
                        <Link
                            to="/"
                            className="cursor-pointer"
                        >
                            <img
                                src={showSolidNav ? "/nene-black-logo.png" : "/nene-white-logo.png"}
                                alt="Nené"
                                className="h-10 md:h-12 w-auto transition-opacity duration-300"
                            />
                        </Link>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-6 justify-end">
                        <div className="hidden md:flex items-center gap-8 mr-4">
                            {navItems.slice(3).map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={(e) => handleNavClick(e, item.path)}
                                    className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${showSolidNav ? 'text-nene-black hover:text-vitality-teal' : 'text-white/80 hover:text-white'}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {isAuthenticated ? (
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className={`flex items-center gap-2 transition-colors ${showSolidNav ? 'text-nene-black hover:text-vitality-teal' : 'text-white hover:text-biscuit-gold'}`}
                                >
                                    <User size={24} strokeWidth={1.5} />
                                </button>
                                {/* Dropdown remains similar but styled */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-4 w-56 bg-white rounded-none shadow-xl py-2 border border-stone-100 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-6 py-4 border-b border-stone-100">
                                            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Signed in as</p>
                                            <p className="text-sm font-medium text-nene-black truncate font-serif">{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/my-orders"
                                            className="block px-6 py-3 text-sm text-stone-600 hover:bg-stone-50 hover:text-nene-black transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            My Orders
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className={`hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${showSolidNav ? 'text-nene-black hover:text-vitality-teal' : 'text-white hover:text-biscuit-gold'}`}
                            >
                                Sign in
                            </Link>
                        )}

                        <button
                            onClick={onOpenCart}
                            className={`relative transition-colors ${showSolidNav ? 'text-nene-black hover:text-vitality-teal' : 'text-white hover:text-biscuit-gold'}`}
                        >
                            <ShoppingBag size={24} strokeWidth={1.5} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-vitality-teal text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            className={`md:hidden ${showSolidNav ? 'text-nene-black' : 'text-white'}`}
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Sidebar (Offcanvas) */}
            <div
                className={`md:hidden fixed inset-0 bg-nene-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
            />
            <div className={`md:hidden fixed top-0 left-0 h-full w-[300px] bg-greek-cream z-[70] transform transition-transform duration-300 shadow-2xl flex flex-col p-8 overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center mb-12">
                    <img src="/nene-black-logo.png" alt="Nené" className="h-8 w-auto" />
                    <button onClick={() => setMobileMenuOpen(false)} className="text-stone-400 hover:text-nene-black">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex flex-col gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={(e) => handleNavClick(e, item.path)}
                            className={`text-left text-xl font-medium transition-colors ${location.pathname === item.path || (item.path.includes('#') && location.hash === item.path.split('#')[1])
                                ? 'text-vitality-teal font-bold'
                                : 'text-stone-600'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Contact Link */}
                    <Link
                        to="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-left text-xl font-medium transition-colors ${location.pathname === '/contact' ? 'text-vitality-teal font-bold' : 'text-stone-600'}`}
                    >
                        Contact
                    </Link>

                    <div className="border-t border-stone-200 pt-6 mt-2">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-vitality-teal font-bold">
                                        {user?.first_name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-nene-black">{user?.first_name} {user?.last_name}</p>
                                        <p className="text-xs text-stone-500">{user?.email}</p>
                                    </div>
                                </div>
                                <Link
                                    to="/my-orders"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-lg font-medium text-stone-600 mb-4"
                                >
                                    My Orders
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className="text-lg font-medium text-red-600"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-center w-full py-3 rounded-xl border border-stone-200 text-nene-black font-medium hover:bg-stone-50"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-center w-full py-3 rounded-xl bg-nene-black text-white font-medium hover:bg-stone-800"
                                >
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Info & Social Links */}
                <div className="mt-auto pt-6 border-t border-stone-200">
                    {/* Contact Info */}
                    {contactInfo && (
                        <div className="space-y-3 mb-6">
                            {contactInfo.phone && (
                                <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 text-stone-500 hover:text-vitality-teal text-sm">
                                    <Phone size={16} />
                                    <span>{contactInfo.phone}</span>
                                </a>
                            )}
                            {contactInfo.email && (
                                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-stone-500 hover:text-vitality-teal text-sm">
                                    <Mail size={16} />
                                    <span>{contactInfo.email}</span>
                                </a>
                            )}
                            {contactInfo.address && (
                                <div className="flex items-start gap-3 text-stone-500 text-sm">
                                    <MapPin size={16} className="shrink-0 mt-0.5" />
                                    <span>{contactInfo.address}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Social Links */}
                    {socialLinks && socialLinks.length > 0 && (
                        <div className="flex gap-4 mb-4">
                            {socialLinks.map((link) => {
                                const Icon = getIcon(link.platform);
                                return (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-stone-400 hover:text-vitality-teal transition-colors"
                                        title={link.platform}
                                    >
                                        <Icon size={20} />
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    <p className="text-stone-500 text-sm">© 2025 Nené Foods.</p>
                </div>
            </div>
        </>
    );
};

export default Navbar;

