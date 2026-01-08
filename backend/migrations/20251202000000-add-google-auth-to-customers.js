'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add google_id column
        await queryInterface.addColumn('customers', 'google_id', {
            type: Sequelize.STRING,
            unique: true,
            allowNull: true
        });

        // Make password_hash nullable
        await queryInterface.changeColumn('customers', 'password_hash', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove google_id column
        await queryInterface.removeColumn('customers', 'google_id');

        // Revert password_hash to not null (WARNING: This might fail if there are records with null passwords)
        await queryInterface.changeColumn('customers', 'password_hash', {
            type: Sequelize.STRING,
            allowNull: false
        });
    }
};
