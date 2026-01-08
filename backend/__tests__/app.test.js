const request = require('supertest');
const app = require('../app');

describe('App', () => {
    it('should return welcome message on GET /', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Welcome to Nene API');
    });
});
