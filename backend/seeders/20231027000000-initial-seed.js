'use strict';
const bcrypt = require('bcrypt');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Seed Admin User
        await queryInterface.bulkInsert('admin_users', [{
            email: 'admin@nene.com',
            password_hash: hashedPassword,
            full_name: 'Super Admin',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        }]);

        // Seed Shipping Config
        await queryInterface.bulkInsert('shipping_config', [
            { state_name: 'Lagos', shipping_fee: 1500.00, is_active: true, created_at: new Date(), updated_at: new Date() },
            { state_name: 'Abuja (FCT)', shipping_fee: 2500.00, is_active: true, created_at: new Date(), updated_at: new Date() },
            { state_name: 'Rivers', shipping_fee: 3000.00, is_active: true, created_at: new Date(), updated_at: new Date() },
            { state_name: 'Ogun', shipping_fee: 2000.00, is_active: true, created_at: new Date(), updated_at: new Date() },
            { state_name: 'Oyo', shipping_fee: 2000.00, is_active: true, created_at: new Date(), updated_at: new Date() },
            { state_name: 'Enugu', shipping_fee: 3000.00, is_active: true, created_at: new Date(), updated_at: new Date() },
            { state_name: 'Kano', shipping_fee: 3500.00, is_active: true, created_at: new Date(), updated_at: new Date() },
            { state_name: 'Kaduna', shipping_fee: 3500.00, is_active: true, created_at: new Date(), updated_at: new Date() }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('shipping_config', null, {});
        await queryInterface.bulkDelete('admin_users', null, {});
    }
};
