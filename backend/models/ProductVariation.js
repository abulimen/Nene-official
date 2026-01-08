const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const ProductVariation = sequelize.define('ProductVariation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'product_variations',
    underscored: true,
    indexes: [
        {
            fields: ['product_id']
        },
        {
            fields: ['is_available']
        }
    ]
});

module.exports = ProductVariation;
