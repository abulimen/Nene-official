const { supabase } = require('../utils/supabase');
const { generateToken, comparePassword, hashPassword } = require('../utils/auth');
const emailService = require('../services/emailService');

// Generate a random 6-digit code
const generate2FACode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
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

        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user || !user.is_active) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid credentials'
                }
            });
        }

        const isMatch = await comparePassword(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid credentials'
                }
            });
        }

        // Check if 2FA is enabled
        if (user.two_factor_enabled) {
            // Generate and save 2FA code
            const code = generate2FACode();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

            await supabase
                .from('admin_users')
                .update({
                    two_factor_temp_code: code,
                    two_factor_temp_expires: expiresAt
                })
                .eq('id', user.id);

            // Send 2FA code via email
            try {
                await emailService.send2FACode(user.email, code, user.full_name);
            } catch (emailError) {
                console.error('Failed to send 2FA email:', emailError);
            }

            return res.json({
                success: true,
                data: {
                    requires_2fa: true,
                    email: user.email,
                    message: 'A verification code has been sent to your email'
                }
            });
        }

        // Update last login
        await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    two_factor_enabled: user.two_factor_enabled
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

const verify2FA = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and verification code are required'
                }
            });
        }

        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid verification attempt'
                }
            });
        }

        // Check if code matches and is not expired
        if (user.two_factor_temp_code !== code) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Invalid verification code'
                }
            });
        }

        if (new Date() > new Date(user.two_factor_temp_expires)) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'CODE_EXPIRED',
                    message: 'Verification code has expired'
                }
            });
        }

        // Clear the temp code and update last login
        await supabase
            .from('admin_users')
            .update({
                two_factor_temp_code: null,
                two_factor_temp_expires: null,
                last_login: new Date().toISOString()
            })
            .eq('id', user.id);

        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    two_factor_enabled: user.two_factor_enabled
                }
            }
        });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred during verification'
            }
        });
    }
};

const logout = (req, res) => {
    // Client-side logout (clear token), server just responds success
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

const getProfile = (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user.id,
            email: req.user.email,
            full_name: req.user.full_name,
            last_login: req.user.last_login,
            two_factor_enabled: req.user.two_factor_enabled
        }
    });
};

const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Current password and new password are required'
                }
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'New password must be at least 8 characters long'
                }
            });
        }

        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        const isMatch = await comparePassword(current_password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Current password is incorrect'
                }
            });
        }

        const hashedPassword = await hashPassword(new_password);

        await supabase
            .from('admin_users')
            .update({ password_hash: hashedPassword })
            .eq('id', req.user.id);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while changing password'
            }
        });
    }
};

const changeEmail = async (req, res) => {
    try {
        const { new_email, password } = req.body;

        if (!new_email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'New email and password are required'
                }
            });
        }

        // Verify password
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        const isMatch = await comparePassword(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Password is incorrect'
                }
            });
        }

        // Check if email is already in use
        const { data: existingUser } = await supabase
            .from('admin_users')
            .select('id')
            .eq('email', new_email)
            .single();

        if (existingUser && existingUser.id !== user.id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'EMAIL_EXISTS',
                    message: 'This email is already in use'
                }
            });
        }

        await supabase
            .from('admin_users')
            .update({ email: new_email })
            .eq('id', req.user.id);

        res.json({
            success: true,
            message: 'Email changed successfully',
            data: { email: new_email }
        });
    } catch (error) {
        console.error('Change email error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while changing email'
            }
        });
    }
};

const enable2FA = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('two_factor_enabled')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        if (user.two_factor_enabled) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_ENABLED',
                    message: '2FA is already enabled'
                }
            });
        }

        await supabase
            .from('admin_users')
            .update({ two_factor_enabled: true })
            .eq('id', req.user.id);

        res.json({
            success: true,
            message: '2FA has been enabled. You will need to enter a verification code on your next login.'
        });
    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while enabling 2FA'
            }
        });
    }
};

const disable2FA = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Password is required to disable 2FA'
                }
            });
        }

        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        const isMatch = await comparePassword(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_INVALID',
                    message: 'Password is incorrect'
                }
            });
        }

        await supabase
            .from('admin_users')
            .update({
                two_factor_enabled: false,
                two_factor_temp_code: null,
                two_factor_temp_expires: null
            })
            .eq('id', req.user.id);

        res.json({
            success: true,
            message: '2FA has been disabled'
        });
    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while disabling 2FA'
            }
        });
    }
};

module.exports = {
    login,
    verify2FA,
    logout,
    getProfile,
    changePassword,
    changeEmail,
    enable2FA,
    disable2FA
};
