const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const DiscountCode = sequelize.define('DiscountCode', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    minimum_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    usage_limit: {
        type: DataTypes.INTEGER
    },
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    expires_at: {
        type: DataTypes.DATE
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'discount_codes',
    underscored: true,
    indexes: [
        { fields: ['code'] },
        { fields: ['is_active'] },
        { fields: ['expires_at'] }
    ]
});

module.exports = DiscountCode;
