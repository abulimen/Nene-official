'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add phone field to contact_messages
        await queryInterface.addColumn('contact_messages', 'phone', {
            type: Sequelize.STRING(50),
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('contact_messages', 'phone');
    }
};
