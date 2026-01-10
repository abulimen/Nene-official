const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabase');

const authenticate = async (req, res, next) => {
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

        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user || !user.is_active) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid or expired token'
                }
            });
        }

        req.user = user;
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

module.exports = { authenticate };
