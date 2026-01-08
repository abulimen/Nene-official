const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add 2FA fields to admin_users table
        await queryInterface.addColumn('admin_users', 'two_factor_enabled', {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        });

        await queryInterface.addColumn('admin_users', 'two_factor_temp_code', {
            type: DataTypes.STRING(10),
            allowNull: true
        });

        await queryInterface.addColumn('admin_users', 'two_factor_temp_expires', {
            type: DataTypes.DATE,
            allowNull: true
        });

        // Create contact_info table (singleton for business contact details)
        await queryInterface.createTable('contact_info', {
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
            created_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create contact_messages table
        await queryInterface.createTable('contact_messages', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            subject: {
                type: DataTypes.STRING(200),
                allowNull: false
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            is_read: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            replied_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create telegram_config table
        await queryInterface.createTable('telegram_config', {
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
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Insert default contact info
        await queryInterface.bulkInsert('contact_info', [{
            phone: '+234 800 123 4567',
            email: 'hello@nene.ng',
            address: '123 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
            business_hours: 'Mon-Fri 9am to 5pm',
            created_at: new Date(),
            updated_at: new Date()
        }]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('admin_users', 'two_factor_enabled');
        await queryInterface.removeColumn('admin_users', 'two_factor_temp_code');
        await queryInterface.removeColumn('admin_users', 'two_factor_temp_expires');
        await queryInterface.dropTable('contact_info');
        await queryInterface.dropTable('contact_messages');
        await queryInterface.dropTable('telegram_config');
    }
};
