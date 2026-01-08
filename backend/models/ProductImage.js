const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const ProductImage = sequelize.define('ProductImage', {
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
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'product_images',
    timestamps: true,
    underscored: true
});

module.exports = ProductImage;
