const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const SocialMediaLink = sequelize.define('SocialMediaLink', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    platform: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    icon_name: {
        type: DataTypes.STRING(50)
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
    timestamps: true,
    tableName: 'social_media_links',
    underscored: true,
    indexes: [
        { fields: ['display_order'] },
        { fields: ['is_active'] }
    ]
});

module.exports = SocialMediaLink;
