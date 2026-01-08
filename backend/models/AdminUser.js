const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const AdminUser = sequelize.define('AdminUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(100)
    },
    last_login: {
        type: DataTypes.DATE
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    two_factor_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    two_factor_temp_code: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    two_factor_temp_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'admin_users',
    underscored: true,
    indexes: [
        { fields: ['email'] }
    ]
});

module.exports = AdminUser;
