const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const TelegramConfig = sequelize.define('TelegramConfig', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bot_token: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    chat_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    notify_on_purchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notify_on_review: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'telegram_config',
    underscored: true
});

module.exports = TelegramConfig;
