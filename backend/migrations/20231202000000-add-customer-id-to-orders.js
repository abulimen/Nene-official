'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if customer_id column exists before adding it
        const orderTableInfo = await queryInterface.describeTable('orders');

        if (!orderTableInfo.customer_id) {
            // Add customer_id column to orders table
            await queryInterface.addColumn('orders', 'customer_id', {
                type: Sequelize.INTEGER,
                allowNull: true, // Allow null for existing orders
                after: 'order_number'
            });
        }
    },

    async down(queryInterface, Sequelize) {
        // Remove customer_id from orders
        const orderTableInfo = await queryInterface.describeTable('orders');

        if (orderTableInfo.customer_id) {
            await queryInterface.removeColumn('orders', 'customer_id');
        }
    }
};
