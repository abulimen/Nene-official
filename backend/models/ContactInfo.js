const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const ContactInfo = sequelize.define('ContactInfo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    business_hours: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    whatsapp: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Lagos, Nigeria'
    },
    hero_title: {
        type: DataTypes.STRING(200),
        allowNull: true,
        defaultValue: 'Handcrafted with Love'
    },
    hero_subtitle: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'Discover our artisanal yogurt collection, made fresh daily with premium ingredients. Pure, creamy, delicious.'
    },
    footer_tagline: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'Handcrafted artisanal yogurt made with love and premium ingredients. Experience the difference of truly fresh dairy.'
    }
}, {
    timestamps: true,
    tableName: 'contact_info',
    underscored: true
});

module.exports = ContactInfo;
