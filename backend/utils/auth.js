const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

module.exports = {
    generateToken,
    comparePassword,
    hashPassword
};
