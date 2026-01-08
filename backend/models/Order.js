const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    customer_first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    customer_last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    customer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    customer_phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    shipping_city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shipping_state: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    payment_reference: {
        type: DataTypes.STRING
    },
    order_status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    discount_code_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    tableName: 'orders',
    underscored: true,
    indexes: [
        { fields: ['order_number'] },
        { fields: ['customer_email'] },
        { fields: ['order_status'] },
        { fields: ['payment_status'] },
        { fields: ['created_at'] }
    ]
});

module.exports = Order;
