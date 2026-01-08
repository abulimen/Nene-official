'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('products', 'is_available', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('products', 'is_available');
    }
};
