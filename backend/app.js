const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
const path = require('path');

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow both localhost and network addresses
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from uploads directory
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const blogRoutes = require('./routes/blogRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const discountRoutes = require('./routes/discountRoutes');
const orderRoutes = require('./routes/orderRoutes');
const faqRoutes = require('./routes/faqRoutes');
const contactRoutes = require('./routes/contactRoutes');

app.use('/api/admin', authRoutes);
app.use('/api/auth', customerAuthRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', productRoutes);
app.use('/api', blogRoutes);
app.use('/api', settingsRoutes);
app.use('/api', discountRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', faqRoutes);
app.use('/api/contact', contactRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Nene API' });
});

module.exports = app;
