'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Customers table already exists, skipping
        // await queryInterface.createTable('customers', ...);

        // 2. Carts table already exists, skipping
        // await queryInterface.createTable('carts', ...);

        // 3. Cart Items
        await queryInterface.createTable('cart_items', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            cart_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'carts',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add Indexes
        // await queryInterface.addIndex('customers', ['email']);
        // await queryInterface.addIndex('carts', ['customer_id']);
        await queryInterface.addIndex('cart_items', ['cart_id']);
        await queryInterface.addIndex('cart_items', ['product_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('cart_items');
        // await queryInterface.dropTable('carts');
        // await queryInterface.dropTable('customers');
    }
};
