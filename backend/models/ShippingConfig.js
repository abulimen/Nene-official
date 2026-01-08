const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const ShippingConfig = sequelize.define('ShippingConfig', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    state_name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    shipping_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'shipping_config',
    underscored: true,
    indexes: [
        { fields: ['state_name'] },
        { fields: ['is_active'] }
    ]
});

module.exports = ShippingConfig;
