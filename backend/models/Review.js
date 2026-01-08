const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    customer_email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    review_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'reviews',
    underscored: true,
    indexes: [
        { fields: ['product_id'] },
        { fields: ['status'] },
        { fields: ['created_at'] }
    ]
});

Review.addScope('approved', {
    where: {
        status: 'approved'
    }
});

module.exports = Review;
