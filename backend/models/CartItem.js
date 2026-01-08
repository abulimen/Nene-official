const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    variation_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Null means no variation (default product)
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    }
}, {
    timestamps: true,
    tableName: 'cart_items',
    underscored: true,
    indexes: [
        { fields: ['cart_id'] },
        { fields: ['product_id'] }
    ]
});

module.exports = CartItem;
