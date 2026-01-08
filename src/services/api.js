import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const adminToken = localStorage.getItem('adminToken');
    const customerToken = localStorage.getItem('customer_token');

    // Determine which token to use based on the request URL
    if (config.url && config.url.startsWith('/admin')) {
        // Admin routes only use admin token
        if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }
    } else {
        // Customer/public routes use customer token
        if (customerToken) {
            config.headers.Authorization = `Bearer ${customerToken}`;
        }
    }
    return config;
});

// Add response interceptor for 401 handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if this was an admin request
            const requestUrl = error.config?.url || '';
            if (requestUrl.startsWith('/admin')) {
                // Clear admin credentials
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');

                // Redirect to admin login if not already there
                if (window.location.pathname !== '/admin/login') {
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const productService = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    getReviews: (id) => api.get(`/products/${id}/reviews`),
    getFeaturedReviews: () => api.get('/reviews/featured'),
    submitReview: (data) => api.post('/reviews', data),
};

export const reviewService = {
    submitReview: (productId, data) => api.post('/reviews', { product_id: productId, ...data }),
    getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
};

export const blogService = {
    getAll: () => api.get('/blog'),
    getById: (id) => api.get(`/blog/${id}`),
};

export const settingsService = {
    getShippingStates: () => api.get('/shipping/states'),
    getSocialMedia: () => api.get('/settings/social-media'),
    getContactInfo: () => api.get('/contact/info'),
};

export const contactService = {
    getContactInfo: () => api.get('/contact/info'),
    submitMessage: (data) => api.post('/contact/message', data),
};

export const faqService = {
    getAll: () => api.get('/faqs'),
};

export const discountService = {
    validateDiscount: (data) => api.post('/discount/validate', data),
};

export const orderService = {
    createOrder: (data) => api.post('/orders/create', data),
    getMyOrders: () => api.get('/orders/my-orders'),
    retryPayment: (orderId) => api.post(`/orders/${orderId}/retry-payment`),
    cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`)
};

export const authService = {
    login: (credentials) => api.post('/admin/login', credentials),
    verify2FA: (data) => api.post('/admin/verify-2fa', data),
    logout: () => api.post('/admin/logout'),
    getProfile: () => api.get('/admin/profile'),
    changePassword: (data) => api.post('/admin/change-password', data),
    changeEmail: (data) => api.post('/admin/change-email', data),
    enable2FA: () => api.post('/admin/enable-2fa'),
    disable2FA: (data) => api.post('/admin/disable-2fa', data),
};

export const adminService = {
    getOrders: (params) => api.get('/admin/orders', { params }),
    getAdminOrder: (id) => api.get(`/admin/orders/${id}`), // Alias for consistency
    getOrderById: (id) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id, status, notes) => api.put(`/admin/orders/${id}/status`, { status, notes }),
    updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),

    getAdminProducts: () => api.get('/admin/products'), // Alias for consistency
    getAllProducts: () => api.get('/admin/products'),
    createProduct: (data) => api.post('/admin/products', data),
    updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),
    addProductImage: (id, data) => api.post(`/admin/products/${id}/images`, data),
    deleteProductImage: (id, imageId) => api.delete(`/admin/products/${id}/images/${imageId}`),

    // Product Variations
    createVariation: (productId, data) => api.post(`/admin/products/${productId}/variations`, data),
    updateVariation: (productId, variationId, data) => api.put(`/admin/products/${productId}/variations/${variationId}`, data),
    deleteVariation: (productId, variationId) => api.delete(`/admin/products/${productId}/variations/${variationId}`),

    getDashboardStats: () => api.get('/admin/dashboard/stats'),

    // Admin Reviews
    getAdminReviews: (params) => api.get('/admin/reviews', { params }),
    updateReviewStatus: (id, status) => api.put(`/admin/reviews/${id}/status`, { status }),
    toggleFeaturedReview: (id) => api.put(`/admin/reviews/${id}/feature`),
    deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

    // Blog
    getBlogPosts: () => api.get('/admin/blog'),
    createBlogPost: (data) => api.post('/admin/blog', data),
    updateBlogPost: (id, data) => api.put(`/admin/blog/${id}`, data),
    deleteBlogPost: (id) => api.delete(`/admin/blog/${id}`),

    // Admin Settings - Shipping
    getAdminShipping: () => api.get('/admin/shipping'),
    createShipping: (data) => api.post('/admin/shipping', data),
    updateShipping: (id, data) => api.put(`/admin/shipping/${id}`, data),
    deleteShipping: (id) => api.delete(`/admin/shipping/${id}`),

    // Admin Settings - Discounts
    getAdminDiscounts: () => api.get('/admin/discounts'),
    createDiscount: (data) => api.post('/admin/discounts', data),
    updateDiscount: (id, data) => api.put(`/admin/discounts/${id}`, data),
    deleteDiscount: (id) => api.delete(`/admin/discounts/${id}`),

    // Admin Settings - Social Media
    getAdminSocialMedia: () => api.get('/admin/social-media'),
    createSocialMedia: (data) => api.post('/admin/social-media', data),
    updateSocialMedia: (id, data) => api.put(`/admin/social-media/${id}`, data),
    deleteSocialMedia: (id) => api.delete(`/admin/social-media/${id}`),

    // Admin Settings - Telegram
    getTelegramConfig: () => api.get('/admin/telegram'),
    updateTelegramConfig: (data) => api.put('/admin/telegram', data),
    testTelegramMessage: () => api.post('/admin/telegram/test'),

    // Admin Settings - Contact Info
    getContactInfo: () => api.get('/admin/contact-info'),
    updateContactInfo: (data) => api.put('/admin/contact-info', data),

    // Admin Messages
    getMessages: (params) => api.get('/admin/messages', { params }),
    getMessage: (id) => api.get(`/admin/messages/${id}`),
    getUnreadCount: () => api.get('/admin/messages/unread-count'),
    markMessageAsRead: (id) => api.put(`/admin/messages/${id}/read`),
    deleteMessage: (id) => api.delete(`/admin/messages/${id}`),

    // Admin FAQ
    getAdminFAQs: () => api.get('/admin/faqs'),
    createFAQ: (data) => api.post('/admin/faqs', data),
    updateFAQ: (id, data) => api.put(`/admin/faqs/${id}`, data),
    deleteFAQ: (id) => api.delete(`/admin/faqs/${id}`),

    // General
    uploadImage: (formData) => api.post('/admin/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

export default api;

