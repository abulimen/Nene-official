'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add hero and footer text fields to contact_info
        await queryInterface.addColumn('contact_info', 'hero_title', {
            type: Sequelize.STRING(200),
            allowNull: true,
            defaultValue: 'Handcrafted with Love'
        });

        await queryInterface.addColumn('contact_info', 'hero_subtitle', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: 'Discover our artisanal yogurt collection, made fresh daily with premium ingredients. Pure, creamy, delicious.'
        });

        await queryInterface.addColumn('contact_info', 'footer_tagline', {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: 'Handcrafted artisanal yogurt made with love and premium ingredients. Experience the difference of truly fresh dairy.'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('contact_info', 'hero_title');
        await queryInterface.removeColumn('contact_info', 'hero_subtitle');
        await queryInterface.removeColumn('contact_info', 'footer_tagline');
    }
};
