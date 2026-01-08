const { sequelize } = require('./utils/db');
const { Cart, CartItem, Product, Customer } = require('./models').models;

async function testCart() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection successful.');

        // Find a customer
        const customer = await Customer.findOne();
        if (!customer) {
            console.log('No customers found. Creating one...');
            // Create a dummy customer
            await Customer.create({
                email: 'test@example.com',
                password_hash: 'hash',
                first_name: 'Test',
                last_name: 'User',
                phone: '1234567890'
            });
        }

        const customerId = customer ? customer.id : 1;
        console.log('Using customer ID:', customerId);

        console.log('Fetching cart...');
        let cart = await Cart.findOne({
            where: { customer_id: customerId },
            include: [
                {
                    model: CartItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'image_url', 'size'] // Removed 'slug' if not in model
                        }
                    ]
                }
            ]
        });

        console.log('Cart found:', cart ? 'Yes' : 'No');

        if (!cart) {
            console.log('Creating cart...');
            cart = await Cart.create({ customer_id: customerId });
            console.log('Cart created with ID:', cart.id);
        }

        console.log('Test successful');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await sequelize.close();
    }
}

testCart();
