require('dotenv').config();
const { models, sequelize } = require('./models');
const { Product, ProductImage } = models;

const products = [
    {
        name: 'Nene Unsweetened Greek Yogurt',
        description: 'Premium Greek yogurt with no added sugar. Rich, creamy, and packed with protein. Perfect for health-conscious individuals and those looking for a versatile, nutritious base for meals and snacks.',
        price: 2500,
        category: 'Yogurt',
        stock_quantity: 100,
        is_available: true,
        images: ['products/unsweetened-yogurt.jpg']
    },
    {
        name: 'Nene Sweetened Greek Yogurt',
        description: 'Deliciously creamy Greek yogurt with a touch of natural sweetness. High in protein and probiotics, perfect for breakfast or as a healthy snack any time of day.',
        price: 2500,
        category: 'Yogurt',
        stock_quantity: 100,
        is_available: true,
        images: ['products/sweetened-yogurt.jpg']
    },
    {
        name: 'Nene Yogurt Parfait',
        description: 'Layers of creamy Greek yogurt, fresh fruits, and crunchy granola. A perfectly balanced and nutritious treat that delights your taste buds while fueling your body.',
        price: 3500,
        category: 'Parfait',
        stock_quantity: 50,
        is_available: true,
        images: ['products/yogurt-parfait.jpg']
    },
    {
        name: 'Nene Chocolate & Red Velvet Parfait',
        description: 'An indulgent fusion of rich chocolate and velvety red velvet layers combined with our signature Greek yogurt. A decadent dessert that is surprisingly nutritious.',
        price: 4000,
        category: 'Parfait',
        stock_quantity: 50,
        is_available: true,
        images: ['products/chocolate-red-velvet-parfait.jpg']
    },
    {
        name: 'Nene Frozen Yogurt (Ice Cream)',
        description: 'The perfect guilt-free frozen treat! Our Greek yogurt transformed into a creamy, delicious ice cream alternative. Lower in calories, higher in protein, and absolutely delightful.',
        price: 3000,
        category: 'Frozen Yogurt',
        stock_quantity: 75,
        is_available: true,
        images: ['products/ice-cream.jpg']
    },
    {
        name: 'Nene Chicken Shawarma',
        description: 'Tender, marinated chicken shawarma served with our signature yogurt-based sauce. A protein-packed, flavorful meal that combines Middle Eastern cuisine with the health benefits of Greek yogurt.',
        price: 5000,
        category: 'Ready Meals',
        stock_quantity: 30,
        is_available: true,
        images: ['products/chicken-shawarma.png']
    }
];

async function addProducts() {
    try {
        console.log('Connecting to database...\n');
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        console.log('Starting to add products...\n');

        for (const productData of products) {
            try {
                // Extract images from product data
                const images = productData.images;
                delete productData.images;

                // Create product
                const product = await Product.create(productData);

                // Add product images
                for (const imageUrl of images) {
                    await ProductImage.create({
                        product_id: product.id,
                        image_url: imageUrl,
                        is_primary: true
                    });
                }

                console.log(`✅ Added: ${product.name}`);
                console.log(`   ID: ${product.id}`);
                console.log(`   Price: ₦${product.price.toLocaleString()}`);
                console.log(`   Stock: ${product.stock_quantity}\n`);
            } catch (error) {
                console.error(`❌ Failed to add: ${productData.name}`);
                console.error(`   Error: ${error.message}\n`);
            }
        }

        console.log('✅ Product addition completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database error:', error);
        process.exit(1);
    }
}

addProducts();
