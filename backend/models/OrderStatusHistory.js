const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    old_status: {
        type: DataTypes.STRING(50)
    },
    new_status: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    changed_by: {
        type: DataTypes.INTEGER
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    updatedAt: false, // Only createdAt is needed for history
    tableName: 'order_status_history',
    underscored: true,
    indexes: [
        { fields: ['order_id'] }
    ]
});

module.exports = OrderStatusHistory;
