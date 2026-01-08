const request = require('supertest');
const app = require('../app');
const { models, sequelize } = require('../models');
const { Product } = models;


describe('Product API', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Reset DB
        // Seed data
        await Product.create({
            name: 'Test Yogurt',
            description: 'Delicious test yogurt',
            price: 5000,
            stock_quantity: 10,
            category: 'Yogurt',
            image_url: 'http://example.com/image.jpg'
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should fetch all products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe('Test Yogurt');
    });

    it('should fetch a single product by ID', async () => {
        const product = await Product.findOne({ where: { name: 'Test Yogurt' } });
        const res = await request(app).get(`/api/products/${product.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.name).toBe('Test Yogurt');
    });

    it('should return 404 for non-existent product', async () => {
        const res = await request(app).get('/api/products/99999');
        expect(res.statusCode).toEqual(404);
    });
});
