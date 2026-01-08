'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'tags', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Comma-separated product tags'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'tags');
  }
};
