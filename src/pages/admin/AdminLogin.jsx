import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { ArrowLeft, Shield } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2FA State
    const [requires2FA, setRequires2FA] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [twoFAMessage, setTwoFAMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({ email, password });
            const data = response.data.data;

            // Check if 2FA is required
            if (data.requires_2fa) {
                setRequires2FA(true);
                setTwoFAMessage(data.message);
                setLoading(false);
                return;
            }

            // Direct login success
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.verify2FA({ email, code: verificationCode });
            const { token, user } = response.data.data;

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setRequires2FA(false);
        setVerificationCode('');
        setError('');
        setPassword('');
    };

    // 2FA Verification Screen
    if (requires2FA) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-6"
                    >
                        <ArrowLeft size={18} />
                        Back to login
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} className="text-teal-600" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Verification Required</h1>
                        <p className="text-stone-500">{twoFAMessage}</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify2FA} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">Verification Code</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-center text-2xl tracking-widest font-mono"
                                required
                                maxLength={6}
                                autoFocus
                            />
                            <p className="text-xs text-stone-400 mt-2 text-center">
                                Check your email for the verification code
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || verificationCode.length !== 6}
                            className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-stone-400 mt-6">
                        Didn't receive the code?{' '}
                        <button
                            onClick={handleBack}
                            className="text-teal-600 hover:underline"
                        >
                            Try again
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    // Standard Login Screen
    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Admin Login</h1>
                    <p className="text-stone-500">Sign in to manage Nené store</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
