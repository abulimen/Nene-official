require('dotenv').config();
const { models, sequelize } = require('./models');
const { Product } = models;

const productTags = [
    { id: 2, tags: 'Greek Yogurt, Protein' },
    { id: 3, tags: 'Greek Yogurt, Sweet' },
    { id: 4, tags: 'Parfait, Breakfast' },
    { id: 5, tags: 'Parfait, Dessert' },
    { id: 6, tags: 'Frozen, Dessert' },
    { id: 7, tags: 'Savory, Protein' }
];

async function updateProductTags() {
    try {
        console.log('Connecting to database...\n');
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        console.log('Updating product tags...\n');

        for (const { id, tags } of productTags) {
            const product = await Product.findByPk(id);

            if (product) {
                await product.update({ tags });
                console.log(`✅ Updated: ${product.name}`);
                console.log(`   Tags: ${tags}\n`);
            } else {
                console.log(`❌ Product ID ${id} not found\n`);
            }
        }

        console.log('✅ Tag update completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database error:', error);
        process.exit(1);
    }
}

updateProductTags();
