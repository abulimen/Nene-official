const jwt = require('jsonwebtoken');
const { Customer } = require('../models').models;

const authenticateCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_MISSING',
                    message: 'Authentication token is missing'
                }
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        const customer = await Customer.findByPk(decoded.id);

        if (!customer || !customer.is_active) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid or expired token'
                }
            });
        }

        req.user = customer;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'AUTH_FAILED',
                message: 'Authentication failed'
            }
        });
    }
};

module.exports = { authenticateCustomer };
