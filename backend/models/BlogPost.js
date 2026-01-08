const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const BlogPost = sequelize.define('BlogPost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100)
    },
    image_url: {
        type: DataTypes.STRING(500)
    },
    author: {
        type: DataTypes.STRING(100),
        defaultValue: 'Admin'
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    published_at: {
        type: DataTypes.DATE
    }
}, {
    timestamps: true,
    tableName: 'blog_posts',
    underscored: true,
    indexes: [
        { fields: ['is_published', 'published_at'] },
        { fields: ['category'] }
    ]
});

module.exports = BlogPost;
