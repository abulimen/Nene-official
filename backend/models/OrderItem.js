const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    product_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    variation_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    variation_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'order_items',
    underscored: true,
    indexes: [
        { fields: ['order_id'] },
        { fields: ['product_id'] }
    ]
});

module.exports = OrderItem;
