const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    tagline: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0
        }
    },
    size: {
        type: DataTypes.STRING
    },
    ingredients: {
        type: DataTypes.TEXT
    },
    nutrition_info: {
        type: DataTypes.JSON
    },
    image_url: {
        type: DataTypes.STRING(500)
    },
    accent_color: {
        type: DataTypes.STRING(50)
    },
    accent_bg_color: {
        type: DataTypes.STRING(50)
    },
    tags: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'products',
    indexes: [
        {
            fields: ['is_active']
        },
        {
            fields: ['created_at']
        }
    ],
    underscored: true
});

// Scopes
Product.addScope('active', {
    where: {
        is_active: true
    }
});

module.exports = Product;
