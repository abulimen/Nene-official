const request = require('supertest');
const app = require('../app');
const { models, sequelize } = require('../models');
const { AdminUser, Order, Product, OrderItem } = models;
const { hashPassword } = require('../utils/auth');

describe('Admin Order API', () => {
    let token;
    let orderId;
    let productId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Create Admin
        const passwordHash = await hashPassword('password123');
        await AdminUser.create({
            email: 'admin@example.com',
            password_hash: passwordHash,
            full_name: 'Admin User'
        });

        // Login
        const loginRes = await request(app)
            .post('/api/admin/login')
            .send({ email: 'admin@example.com', password: 'password123' });
        token = loginRes.body.data.token;

        // Create Product
        const product = await Product.create({
            name: 'Test Product',
            description: 'Test Description',
            price: 1000,
            stock_quantity: 100,
            category: 'Test',
            image_url: 'http://example.com/img.jpg'
        });
        productId = product.id;

        // Create Order
        const order = await Order.create({
            order_number: 'ORD-123',
            customer_first_name: 'John',
            customer_last_name: 'Doe',
            customer_email: 'john@example.com',
            customer_phone: '1234567890',
            shipping_address: '123 Main St',
            shipping_city: 'Lagos',
            shipping_state: 'Lagos',
            shipping_zip_code: '100001',
            shipping_fee: 500,
            subtotal: 1000,
            total_amount: 1500,
            payment_status: 'paid',
            payment_reference: 'REF-123'
        });
        orderId = order.id;

        await OrderItem.create({
            order_id: order.id,
            product_id: product.id,
            product_name: product.name,
            product_price: 1000,
            quantity: 1,
            subtotal: 1000
        });
    }, 30000); // Increase timeout to 30s

    afterAll(async () => {
        await sequelize.close();
    });

    it('should fetch all orders', async () => {
        const res = await request(app)
            .get('/api/admin/orders')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.orders).toHaveLength(1);
    });

    it('should update order status', async () => {
        const res = await request(app)
            .put(`/api/admin/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'processing', notes: 'Processing order' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.new_status).toBe('processing');
    });

    it('should update order details (edit order)', async () => {
        const res = await request(app)
            .put(`/api/admin/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                shipping_address: '456 New St',
                shipping_city: 'Abuja',
                shipping_state: 'FCT',
                items: [
                    { product_id: productId, quantity: 2, price: 1000 }
                ]
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.shipping_address).toBe('456 New St');
        expect(parseFloat(res.body.data.total_amount)).toBe(2500); // (1000 * 2) + 500 shipping
    });
});
