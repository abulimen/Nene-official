import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, LogOut, Star, FileText,
    Settings, HelpCircle, Mail, User, Sparkles, Menu, X, ChevronRight,
    Store
} from 'lucide-react';
import { authService } from '../../services/api';
import {
    startTour,
    startWelcomeTour,
    getPageKey,
    isFirstLogin,
    isTourCompleted,
    skipAllTours
} from '../../services/adminTourService';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('adminToken');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
        }
    }, [token, navigate]);

    // Check for first login and show welcome modal
    useEffect(() => {
        if (token && isFirstLogin()) {
            const timer = setTimeout(() => {
                setShowWelcomeModal(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [token]);

    // Auto-start page tour if not completed
    useEffect(() => {
        if (!token || showWelcomeModal) return;

        const pageKey = getPageKey(location.pathname);
        if (pageKey && !isTourCompleted(pageKey)) {
            const timer = setTimeout(() => {
                const tour = startTour(pageKey);
                if (tour) tour.drive();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [location.pathname, token, showWelcomeModal]);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            navigate('/admin/login');
        }
    };

    const handleStartTour = () => {
        const pageKey = getPageKey(location.pathname);
        if (pageKey) {
            const tour = startTour(pageKey, { skipMark: true });
            if (tour) tour.drive();
        }
    };

    const handleWelcomeTour = () => {
        setShowWelcomeModal(false);
        const tour = startWelcomeTour();
        if (tour) tour.drive();
    };

    const handleSkipTour = () => {
        setShowWelcomeModal(false);
        skipAllTours();
    };

    if (!token) return null;

    // Grouped menu items for better organization
    const menuGroups = [
        {
            title: 'Overview',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', tourId: 'nav-dashboard' },
            ]
        },
        {
            title: 'Store',
            items: [
                { icon: ShoppingBag, label: 'Orders', path: '/admin/orders', tourId: 'nav-orders' },
                { icon: Package, label: 'Products', path: '/admin/products', tourId: 'nav-products' },
                { icon: Star, label: 'Reviews', path: '/admin/reviews', tourId: 'nav-reviews' },
            ]
        },
        {
            title: 'Content',
            items: [
                { icon: FileText, label: 'Blog', path: '/admin/blog', tourId: 'nav-blog' },
                { icon: HelpCircle, label: 'FAQ', path: '/admin/faqs', tourId: 'nav-faqs' },
                { icon: Mail, label: 'Messages', path: '/admin/messages', tourId: 'nav-messages' },
            ]
        },
        {
            title: 'System',
            items: [
                { icon: Settings, label: 'Settings', path: '/admin/settings', tourId: 'nav-settings' },
                { icon: User, label: 'Account', path: '/admin/account', tourId: 'nav-account' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-stone-100 flex">
            {/* Welcome Modal for First-Time Users */}
            {showWelcomeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-stone-900 mb-2">Welcome to Nené Admin! 👋</h2>
                            <p className="text-stone-500 mb-8">
                                Looks like this is your first time here. Would you like a quick tour to learn how to manage your store?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleSkipTour}
                                    className="flex-1 px-6 py-3.5 border-2 border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-all font-medium"
                                >
                                    Skip for now
                                </button>
                                <button
                                    onClick={handleWelcomeTour}
                                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-semibold shadow-lg shadow-teal-200"
                                >
                                    Start Tour 🚀
                                </button>
                            </div>
                            <p className="text-xs text-stone-400 mt-6">
                                You can restart the tour anytime using the ✨ button
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-20 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                        >
                            <Menu size={22} className="text-stone-700" />
                        </button>
                        <div className="flex items-center gap-2">
                            <img src="/nene-black-logo.png" alt="Nené" className="h-7 w-auto" />
                            <span className="font-bold text-stone-900">Admin</span>
                        </div>
                    </div>
                    <button
                        onClick={handleStartTour}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                        data-tour="tour-button"
                        title="Start Page Tour"
                    >
                        <Sparkles size={20} />
                    </button>
                </div>
            </header>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                data-tour="sidebar"
                className={`
                    fixed top-0 left-0 h-full w-72 bg-white border-r border-stone-200 z-40 
                    transition-transform duration-300 ease-out flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <img src="/nene-black-logo.png" alt="Nené" className="h-8 w-auto" />
                                <p className="text-xs text-stone-400 mt-1">Admin Panel</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleStartTour}
                                className="hidden lg:flex p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                data-tour="tour-button"
                                title="Start Page Tour"
                            >
                                <Sparkles size={18} />
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-stone-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    {menuGroups.map((group, groupIndex) => (
                        <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
                            <p className="px-4 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                {group.title}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname.startsWith(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsSidebarOpen(false)}
                                            data-tour={item.tourId}
                                            className={`
                                                group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-100'
                                                    : 'text-stone-600 hover:bg-stone-100'
                                                }
                                            `}
                                        >
                                            <Icon size={18} className={isActive ? 'text-white' : 'text-stone-400 group-hover:text-teal-600'} />
                                            <span className="font-medium text-sm">{item.label}</span>
                                            {isActive && (
                                                <ChevronRight size={16} className="ml-auto text-white/70" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Section & Logout */}
                <div className="p-4 border-t border-stone-100 bg-stone-50/50">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-stone-200 to-stone-300 rounded-full flex items-center justify-center">
                            <User size={16} className="text-stone-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">Admin User</p>
                            <p className="text-xs text-stone-400">Store Manager</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen">
                <div className="pt-16 lg:pt-0">
                    <div className="p-4 lg:p-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
