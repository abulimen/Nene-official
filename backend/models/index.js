const fs = require('fs');
const path = require('path');
const { sequelize } = require('../utils/db');

const models = {};
const basename = path.basename(__filename);

// Import all models
fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file));
        models[model.name] = model;
    });

// Define Associations
const { Product, Order, OrderItem, Review, OrderStatusHistory, AdminUser, DiscountCode, ProductImage, Customer, Cart, CartItem, ProductVariation } = models;

// Customer Associations
if (Customer && Order) {
    Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
    Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
}

if (Customer && Cart) {
    Customer.hasOne(Cart, { foreignKey: 'customer_id', as: 'cart' });
    Cart.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
}

// Cart Associations
if (Cart && CartItem) {
    Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
    CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
}

// CartItem Associations
if (CartItem && Product) {
    CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    Product.hasMany(CartItem, { foreignKey: 'product_id' });
}

// ProductVariation Associations
if (CartItem && ProductVariation) {
    CartItem.belongsTo(ProductVariation, { foreignKey: 'variation_id', as: 'variation' });
    ProductVariation.hasMany(CartItem, { foreignKey: 'variation_id' });
}

// Product Associations
if (Product && ProductImage) {
    Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
    ProductImage.belongsTo(Product, { foreignKey: 'product_id' });
}

if (Product && ProductVariation) {
    Product.hasMany(ProductVariation, { foreignKey: 'product_id', as: 'variations' });
    ProductVariation.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
}

// Order Associations
if (Order && OrderItem) {
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
}

if (Order && DiscountCode) {
    Order.belongsTo(DiscountCode, { foreignKey: 'discount_code_id', as: 'discountCode' });
    DiscountCode.hasMany(Order, { foreignKey: 'discount_code_id' });
}

if (Order && OrderStatusHistory) {
    Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });
    OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });
}

// OrderItem Associations
if (OrderItem && Product) {
    OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    Product.hasMany(OrderItem, { foreignKey: 'product_id' });
}

// Review Associations
if (Review && Product) {
    Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
}

// OrderStatusHistory Associations
if (OrderStatusHistory && AdminUser) {
    OrderStatusHistory.belongsTo(AdminUser, { foreignKey: 'changed_by', as: 'admin' });
    AdminUser.hasMany(OrderStatusHistory, { foreignKey: 'changed_by' });
}

module.exports = { sequelize, models };
