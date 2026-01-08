const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const FAQ = sequelize.define('FAQ', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    answer: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'faqs',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['is_active', 'display_order']
        }
    ]
});

module.exports = FAQ;
