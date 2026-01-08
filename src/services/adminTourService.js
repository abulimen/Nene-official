import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Custom styling for the tour
const tourStyles = `
.driver-popover {
    background: #1c1917 !important;
    color: #fafaf9 !important;
    border-radius: 16px !important;
    padding: 20px !important;
    max-width: 340px !important;
}
.driver-popover-title {
    color: #fbbf24 !important;
    font-size: 18px !important;
    font-weight: 700 !important;
    margin-bottom: 8px !important;
}
.driver-popover-description {
    color: #d6d3d1 !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
}
.driver-popover-progress-text {
    color: #78716c !important;
    font-size: 12px !important;
}
.driver-popover-navigation-btns {
    gap: 8px !important;
}
.driver-popover-prev-btn {
    background: transparent !important;
    border: 1px solid #57534e !important;
    color: #d6d3d1 !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
}
.driver-popover-prev-btn:hover {
    background: #292524 !important;
}
.driver-popover-next-btn, .driver-popover-close-btn {
    background: #fbbf24 !important;
    color: #1c1917 !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-weight: 600 !important;
}
.driver-popover-next-btn:hover, .driver-popover-close-btn:hover {
    background: #f59e0b !important;
}
.driver-popover-arrow-side-left.driver-popover-arrow,
.driver-popover-arrow-side-right.driver-popover-arrow,
.driver-popover-arrow-side-top.driver-popover-arrow,
.driver-popover-arrow-side-bottom.driver-popover-arrow {
    border-color: #1c1917 !important;
}
`;

// Inject custom styles
const injectStyles = () => {
    if (!document.getElementById('admin-tour-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'admin-tour-styles';
        styleSheet.textContent = tourStyles;
        document.head.appendChild(styleSheet);
    }
};

// Tour definitions for each page
const tourDefinitions = {
    dashboard: {
        steps: [
            {
                element: '[data-tour="sidebar"]',
                popover: {
                    title: '📍 Navigation Sidebar',
                    description: 'Use this sidebar to navigate between different sections of your admin panel. Each section helps you manage a specific part of your store.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="dashboard-stats"]',
                popover: {
                    title: '📊 Dashboard Overview',
                    description: 'Here you can see key metrics at a glance - total orders, revenue, products, and customer activity.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="recent-orders"]',
                popover: {
                    title: '🛒 Recent Orders',
                    description: 'Quick view of your most recent orders. Click on any order to see full details.',
                    side: 'top'
                }
            }
        ]
    },
    orders: {
        steps: [
            {
                element: '[data-tour="orders-header"]',
                popover: {
                    title: '📦 Orders Management',
                    description: 'This is your orders hub. View all customer orders, their statuses, and manage fulfillment.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="orders-filters"]',
                popover: {
                    title: '🔍 Filter Orders',
                    description: 'Use these filters to find orders by status (pending, processing, shipped, delivered, cancelled).',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="orders-table"]',
                popover: {
                    title: '📋 Orders List',
                    description: 'Click on any order row to view details, update status, or edit order information.',
                    side: 'top'
                }
            }
        ]
    },
    products: {
        steps: [
            {
                element: '[data-tour="products-header"]',
                popover: {
                    title: '🧁 Products Management',
                    description: 'Manage your entire product catalog from here. Add, edit, or remove products.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="add-product-btn"]',
                popover: {
                    title: '➕ Add New Product',
                    description: 'Click here to add a new product to your store with images, pricing, and descriptions.',
                    side: 'left'
                }
            },
            {
                element: '[data-tour="products-grid"]',
                popover: {
                    title: '🖼️ Product Cards',
                    description: 'Each card shows a product preview. Click to edit, toggle availability, or delete products.',
                    side: 'top'
                }
            }
        ]
    },
    reviews: {
        steps: [
            {
                element: '[data-tour="reviews-header"]',
                popover: {
                    title: '⭐ Customer Reviews',
                    description: 'See what customers are saying about your products. Manage and respond to feedback.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="reviews-list"]',
                popover: {
                    title: '💬 Review Details',
                    description: 'Each review shows the customer name, rating, product, and their comments. You can delete inappropriate reviews.',
                    side: 'top'
                }
            }
        ]
    },
    blog: {
        steps: [
            {
                element: '[data-tour="blog-header"]',
                popover: {
                    title: '📝 Blog Management',
                    description: 'Create and manage blog posts to engage customers and improve SEO.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="add-post-btn"]',
                popover: {
                    title: '✍️ Create New Post',
                    description: 'Click here to write a new blog post with a rich text editor, images, and categories.',
                    side: 'left'
                }
            },
            {
                element: '[data-tour="blog-posts"]',
                popover: {
                    title: '📰 Published Posts',
                    description: 'View and manage all your blog posts. Edit, publish/unpublish, or delete posts.',
                    side: 'top'
                }
            }
        ]
    },
    faqs: {
        steps: [
            {
                element: '[data-tour="faq-header"]',
                popover: {
                    title: '❓ FAQ Management',
                    description: 'Manage frequently asked questions that appear on your website to help customers.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="add-faq-btn"]',
                popover: {
                    title: '➕ Add New FAQ',
                    description: 'Add new questions and answers to help customers find information quickly.',
                    side: 'left'
                }
            },
            {
                element: '[data-tour="faq-list"]',
                popover: {
                    title: '📚 FAQ List',
                    description: 'Drag to reorder, click to edit, or delete FAQs as needed.',
                    side: 'top'
                }
            }
        ]
    },
    messages: {
        steps: [
            {
                element: '[data-tour="messages-header"]',
                popover: {
                    title: '✉️ Customer Messages',
                    description: 'View messages from customers who contacted you through the website contact form.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="messages-filter"]',
                popover: {
                    title: '📬 Filter Messages',
                    description: 'Toggle to show only unread messages so you don\'t miss any inquiries.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="messages-list"]',
                popover: {
                    title: '💌 Message Inbox',
                    description: 'Click on any message to read the full content. Messages include contact details for follow-up.',
                    side: 'top'
                }
            }
        ]
    },
    settings: {
        steps: [
            {
                element: '[data-tour="settings-tabs"]',
                popover: {
                    title: '⚙️ Settings Tabs',
                    description: 'Settings are organized into tabs: Shipping rates, Discount codes, Social media links, Contact info, and Telegram notifications.',
                    side: 'bottom'
                }
            },
            {
                popover: {
                    title: '🚚 Shipping Settings',
                    description: 'Set shipping rates for different states/regions where you deliver.',
                }
            },
            {
                popover: {
                    title: '🏷️ Discount Codes',
                    description: 'Create and manage discount codes for promotions and special offers.',
                }
            },
            {
                popover: {
                    title: '📱 Social & Contact',
                    description: 'Update your social media links, business contact info, and website content (Hero banner, Footer text).',
                }
            },
            {
                popover: {
                    title: '📲 Telegram Alerts',
                    description: 'Set up Telegram notifications to get instant alerts for new orders and reviews.',
                }
            }
        ]
    },
    account: {
        steps: [
            {
                element: '[data-tour="account-header"]',
                popover: {
                    title: '👤 Account Settings',
                    description: 'Manage your admin account details and security settings.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="change-password"]',
                popover: {
                    title: '🔐 Change Password',
                    description: 'Keep your account secure by updating your password regularly.',
                    side: 'top'
                }
            }
        ]
    },
    orderDetails: {
        steps: [
            {
                element: '[data-tour="order-header"]',
                popover: {
                    title: '📋 Order Overview',
                    description: 'See the order number, date, and quick access to edit order or update status.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="order-items"]',
                popover: {
                    title: '🛒 Order Items',
                    description: 'All products in this order with quantities, prices, and subtotals.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="customer-info"]',
                popover: {
                    title: '👤 Customer Details',
                    description: 'Customer contact info. Click email or phone to reach out directly.',
                    side: 'left'
                }
            },
            {
                element: '[data-tour="shipping-info"]',
                popover: {
                    title: '🚚 Delivery Address',
                    description: 'Where this order should be shipped to.',
                    side: 'left'
                }
            },
            {
                element: '[data-tour="payment-info"]',
                popover: {
                    title: '💳 Payment Status',
                    description: 'Payment method and current payment status for this order.',
                    side: 'left'
                }
            }
        ]
    }
};

// Get the current page key based on pathname
const getPageKey = (pathname) => {
    if (pathname.includes('/admin/dashboard')) return 'dashboard';
    if (pathname.match(/\/admin\/orders\/\d+/)) return 'orderDetails';
    if (pathname.includes('/admin/orders')) return 'orders';
    if (pathname.includes('/admin/products')) return 'products';
    if (pathname.includes('/admin/reviews')) return 'reviews';
    if (pathname.includes('/admin/blog')) return 'blog';
    if (pathname.includes('/admin/faqs')) return 'faqs';
    if (pathname.includes('/admin/messages')) return 'messages';
    if (pathname.includes('/admin/settings')) return 'settings';
    if (pathname.includes('/admin/account')) return 'account';
    return null;
};

// Check if tour has been completed for this page
const isTourCompleted = (pageKey) => {
    const completed = localStorage.getItem(`admin_tour_${pageKey}`);
    return completed === 'true';
};

// Check if this is first login (no tours completed at all)
const isFirstLogin = () => {
    const hasSeenWelcome = localStorage.getItem('admin_tour_welcome');
    return !hasSeenWelcome;
};

// Mark tour as completed
const markTourCompleted = (pageKey) => {
    localStorage.setItem(`admin_tour_${pageKey}`, 'true');
    localStorage.setItem('admin_tour_welcome', 'true');
};

// Mark all tours as completed (skip all)
const skipAllTours = () => {
    Object.keys(tourDefinitions).forEach(key => {
        localStorage.setItem(`admin_tour_${key}`, 'true');
    });
    localStorage.setItem('admin_tour_welcome', 'true');
};

// Reset all tours (for testing or re-enabling)
const resetAllTours = () => {
    Object.keys(tourDefinitions).forEach(key => {
        localStorage.removeItem(`admin_tour_${key}`);
    });
    localStorage.removeItem('admin_tour_welcome');
};

// Start a tour for a specific page
const startTour = (pageKey, options = {}) => {
    injectStyles();

    const tourDef = tourDefinitions[pageKey];
    if (!tourDef) return null;

    // Filter steps to only include those with existing elements (or no element requirement)
    const validSteps = tourDef.steps.filter(step => {
        if (!step.element) return true;
        return document.querySelector(step.element);
    });

    if (validSteps.length === 0) return null;

    const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.7,
        stagePadding: 10,
        stageRadius: 12,
        popoverOffset: 15,
        showButtons: ['next', 'previous', 'close'],
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Done ✓',
        progressText: '{{current}} of {{total}}',
        onDestroyStarted: () => {
            if (!options.skipMark) {
                markTourCompleted(pageKey);
            }
            driverObj.destroy();
        },
        steps: validSteps
    });

    return driverObj;
};

// Create a welcome tour for first-time admins
const startWelcomeTour = (onComplete, onSkip) => {
    injectStyles();

    const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.75,
        stagePadding: 10,
        stageRadius: 12,
        popoverOffset: 15,
        showButtons: ['next', 'previous'],
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Start Exploring! 🚀',
        progressText: '{{current}} of {{total}}',
        onDestroyStarted: () => {
            localStorage.setItem('admin_tour_welcome', 'true');
            driverObj.destroy();
            if (onComplete) onComplete();
        },
        steps: [
            {
                popover: {
                    title: '👋 Welcome to Nené Admin!',
                    description: 'This is your command center for managing your online store. Let us give you a quick tour of the essentials!',
                }
            },
            {
                element: '[data-tour="sidebar"]',
                popover: {
                    title: '🧭 Navigation Sidebar',
                    description: 'This sidebar is your main navigation. Each section helps you manage a different part of your store.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="nav-orders"]',
                popover: {
                    title: '📦 Orders',
                    description: 'View and manage all customer orders. Update statuses, track deliveries, and more.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="nav-products"]',
                popover: {
                    title: '🧁 Products',
                    description: 'Add, edit, and manage your product catalog. Control pricing, availability, and descriptions.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="nav-settings"]',
                popover: {
                    title: '⚙️ Settings',
                    description: 'Configure shipping rates, discounts, contact info, social media, and notifications.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="tour-button"]',
                popover: {
                    title: '🎓 Need Help?',
                    description: 'Click this button anytime to restart the tour for the current page. Now go explore your dashboard!',
                    side: 'left'
                }
            }
        ]
    });

    return driverObj;
};

export {
    startTour,
    startWelcomeTour,
    getPageKey,
    isTourCompleted,
    isFirstLogin,
    markTourCompleted,
    skipAllTours,
    resetAllTours,
    tourDefinitions
};
