'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add city field to contact_info
        await queryInterface.addColumn('contact_info', 'city', {
            type: Sequelize.STRING(100),
            allowNull: true,
            defaultValue: 'Lagos, Nigeria'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('contact_info', 'city');
    }
};
