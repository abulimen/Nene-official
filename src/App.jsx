import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Gallery from './components/sections/Gallery';
import Testimonials from './components/sections/Testimonials';
import DeliveryInfo from './components/sections/DeliveryInfo';
import Blog from './components/sections/Blog';
import FAQ from './components/sections/FAQ';
import ShopGrid from './components/shop/ShopGrid';
import ProductDetail from './components/shop/ProductDetail';
import Cart from './components/shop/Cart';
import Checkout from './components/shop/Checkout';
import OrderConfirmation from './components/shop/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import ShippingPolicy from './pages/ShippingPolicy';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Products from './pages/Products';
import Orders from './pages/account/Orders';
import BlogPost from './pages/BlogPost';
import BlogListing from './pages/BlogListing';
import Receipt from './pages/Receipt';
import ContactBubble from './components/ui/ContactBubble';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminReviews from './pages/admin/AdminReviews';
import AdminBlog from './pages/admin/AdminBlog';
import BlogEditor from './pages/admin/BlogEditor';
import AdminFAQ from './pages/admin/AdminFAQ';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages';
import AdminAccount from './pages/admin/AdminAccount';

import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';

// Wrapper component to use cart hook
const AppContent = () => {
  const { cartItems, cartOpen, setCartOpen, addToCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="faqs" element={<AdminFAQ />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="account" element={<AdminAccount />} />
        </Route>

        {/* Standalone Route for Receipt (No Navbar/Footer) */}
        <Route path="/receipt/:orderId" element={<Receipt />} />

        {/* Public Routes */}
        <Route path="*" element={
          <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-teal-100 selection:text-teal-900">
            <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} onOpenCart={() => setCartOpen(true)} />

            <Routes>
              <Route path="/" element={
                <main>
                  <Hero />
                  <section id="shop" className="py-20 bg-stone-50">
                    <div className="max-w-7xl mx-auto px-6">
                      <div className="text-center mb-16">
                        <span className="text-stone-500 uppercase tracking-[0.2em] text-xs font-bold">Our Collection</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-nene-black mt-3 font-serif">Artisanal Yogurt & Treats</h2>
                        <div className="w-24 h-1 bg-nene-black mx-auto mt-6"></div>
                      </div>
                      <ShopGrid addToCart={addToCart} />
                    </div>
                  </section>
                  <Gallery />
                  <Testimonials />
                  <DeliveryInfo />
                  <Blog />
                  <FAQ />
                </main>
              } />
              <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
              <Route path="/product/:id/:slug" element={<ProductDetail addToCart={addToCart} />} />
              <Route path="/checkout" element={<Checkout cartItems={cartItems} total={cartTotal} />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog/:category/:slug" element={<BlogPost />} />
              <Route path="/blog/:id" element={<BlogPost />} /> {/* Backward compatibility */}
              <Route path="/blog" element={<BlogListing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products onOpenCart={() => setCartOpen(true)} />} />
              <Route path="/shop" element={<Products onOpenCart={() => setCartOpen(true)} />} />
              <Route path="/account/orders" element={<Orders />} />
            </Routes>

            <Footer />
            <ContactBubble />
            <Cart
              isOpen={cartOpen}
              onClose={() => setCartOpen(false)}
              cartItems={cartItems}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
              total={cartTotal}
              onCheckout={() => {
                setCartOpen(false);
                navigate('/checkout');
              }}
            />
          </div>
        } />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <CustomerAuthProvider>
        <SettingsProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </SettingsProvider>
      </CustomerAuthProvider>
    </Router>
  );
};

export default App;
