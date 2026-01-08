const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true,
    tableName: 'carts',
    underscored: true,
    indexes: [
        { fields: ['customer_id'] }
    ]
});

module.exports = Cart;
