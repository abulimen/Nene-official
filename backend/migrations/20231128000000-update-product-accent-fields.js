'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('products', 'accent_color', {
            type: Sequelize.STRING(50),
            allowNull: true
        });

        await queryInterface.changeColumn('products', 'accent_bg_color', {
            type: Sequelize.STRING(50),
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('products', 'accent_color', {
            type: Sequelize.STRING(7),
            allowNull: true
        });

        await queryInterface.changeColumn('products', 'accent_bg_color', {
            type: Sequelize.STRING(7),
            allowNull: true
        });
    }
};
