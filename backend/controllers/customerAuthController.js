const { supabase } = require('../utils/supabase');
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

        // Check if email exists
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .single();

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

        const { data: customer, error } = await supabase
            .from('customers')
            .insert({
                email,
                password_hash,
                first_name,
                last_name,
                phone
            })
            .select()
            .single();

        if (error) throw error;

        // Create empty cart for new customer
        await supabase
            .from('carts')
            .insert({ customer_id: customer.id });

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

        const { data: customer, error } = await supabase
            .from('customers')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !customer || !customer.is_active) {
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

        // Check if user exists by email or google_id
        const { data: existingByEmail } = await supabase
            .from('customers')
            .select('*')
            .eq('email', email)
            .single();

        const { data: existingByGoogleId } = await supabase
            .from('customers')
            .select('*')
            .eq('google_id', googleId)
            .single();

        let customer = existingByEmail || existingByGoogleId;

        if (customer) {
            // Update google_id if not present (linking account)
            if (!customer.google_id) {
                await supabase
                    .from('customers')
                    .update({ google_id: googleId })
                    .eq('id', customer.id);
            }
        } else {
            // Create new user
            const { data: newCustomer, error } = await supabase
                .from('customers')
                .insert({
                    email,
                    first_name: given_name,
                    last_name: family_name || given_name,
                    google_id: googleId,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            customer = newCustomer;

            // Create cart for new user
            await supabase
                .from('carts')
                .insert({ customer_id: customer.id });
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
