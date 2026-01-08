const axios = require('axios');

const API_URL = 'http://localhost:5000/api/admin';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzMzMjAzMTM5LCJleHAiOjE3MzMyODk1Mzl9.cOQCfqLfAFUllLxDf9lbnxcWZIf6D2RhvMJGDXyPsXs'; // You'll need to get this from localStorage

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
    console.log('Starting to add products...\n');

    for (const product of products) {
        try {
            const response = await axios.post(`${API_URL}/products`, product, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✅ Added: ${product.name}`);
            console.log(`   ID: ${response.data.data.id}`);
            console.log(`   Price: ₦${product.price.toLocaleString()}\n`);
        } catch (error) {
            console.error(`❌ Failed to add: ${product.name}`);
            console.error(`   Error: ${error.response?.data?.error?.message || error.message}\n`);
        }
    }

    console.log('Product addition completed!');
}

addProducts();
