const { Customer, Cart, CartItem } = require('../models').models;
const { generateToken, comparePassword, hashPassword } = require('../utils/auth');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone } = req.body;

        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'All fields are required'
                }
            });
        }

        const existingCustomer = await Customer.findOne({ where: { email } });

        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'EMAIL_EXISTS',
                    message: 'Email already registered'
                }
            });
        }

        const password_hash = await hashPassword(password);

        const customer = await Customer.create({
            email,
            password_hash,
            first_name,
            last_name,
            phone
        });

        // Create empty cart for new customer
        await Cart.create({ customer_id: customer.id });

        const token = generateToken(customer);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: customer.id,
                    email: customer.email,
                    first_name: customer.first_name,
                    last_name: customer.last_name
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred during registration'
            }
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and password are required'
                }
            });
        }

        const customer = await Customer.findOne({ where: { email } });

        if (!customer || !customer.is_active) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid credentials'
                }
            });
        }

        // Check if user has a password (might be a social login user)
        if (!customer.password_hash) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Please sign in with Google'
                }
            });
        }

        const isMatch = await comparePassword(password, customer.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid credentials'
                }
            });
        }

        const token = generateToken(customer);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: customer.id,
                    email: customer.email,
                    first_name: customer.first_name,
                    last_name: customer.last_name
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred during login'
            }
        });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Google credential is required'
                }
            });
        }

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, given_name, family_name, sub: googleId } = payload;

        // Check if user exists
        let customer = await Customer.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email },
                    { google_id: googleId }
                ]
            }
        });

        if (customer) {
            // Update google_id if not present (linking account)
            if (!customer.google_id) {
                await customer.update({ google_id: googleId });
            }
        } else {
            // Create new user
            customer = await Customer.create({
                email,
                first_name: given_name,
                last_name: family_name || given_name, // Fallback if no last name
                google_id: googleId,
                is_active: true
            });

            // Create cart for new user
            await Cart.create({ customer_id: customer.id });
        }

        if (!customer.is_active) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Account is disabled'
                }
            });
        }

        const token = generateToken(customer);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: customer.id,
                    email: customer.email,
                    first_name: customer.first_name,
                    last_name: customer.last_name
                }
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Google authentication failed'
            }
        });
    }
};

const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

const getMe = (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            email: req.user.email,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            phone: req.user.phone
        }
    });
};

module.exports = {
    register,
    login,
    googleLogin,
    logout,
    getMe
};
