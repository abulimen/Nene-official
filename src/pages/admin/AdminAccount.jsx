import React, { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import { User, Lock, Mail, Shield, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

const AdminAccount = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    // Email change state
    const [emailData, setEmailData] = useState({
        new_email: '',
        password: ''
    });
    const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });
    const [changingEmail, setChangingEmail] = useState(false);

    // 2FA state
    const [twoFAMessage, setTwoFAMessage] = useState({ type: '', text: '' });
    const [toggling2FA, setToggling2FA] = useState(false);
    const [disable2FAPassword, setDisable2FAPassword] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authService.getProfile();
            setUser(response.data.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.new_password.length < 8) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setChangingPassword(true);
        try {
            await authService.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            setActiveSection(null);
        } catch (error) {
            setPasswordMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Failed to change password'
            });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setEmailMessage({ type: '', text: '' });

        setChangingEmail(true);
        try {
            const response = await authService.changeEmail({
                new_email: emailData.new_email,
                password: emailData.password
            });
            setEmailMessage({ type: 'success', text: 'Email changed successfully!' });
            setUser({ ...user, email: response.data.data.email });
            setEmailData({ new_email: '', password: '' });
            setActiveSection(null);
        } catch (error) {
            setEmailMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Failed to change email'
            });
        } finally {
            setChangingEmail(false);
        }
    };

    const handleEnable2FA = async () => {
        setTwoFAMessage({ type: '', text: '' });
        setToggling2FA(true);
        try {
            const response = await authService.enable2FA();
            setTwoFAMessage({ type: 'success', text: response.data.message });
            setUser({ ...user, two_factor_enabled: true });
        } catch (error) {
            setTwoFAMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Failed to enable 2FA'
            });
        } finally {
            setToggling2FA(false);
        }
    };

    const handleDisable2FA = async (e) => {
        e.preventDefault();
        setTwoFAMessage({ type: '', text: '' });
        setToggling2FA(true);
        try {
            const response = await authService.disable2FA({ password: disable2FAPassword });
            setTwoFAMessage({ type: 'success', text: response.data.message });
            setUser({ ...user, two_factor_enabled: false });
            setDisable2FAPassword('');
            setActiveSection(null);
        } catch (error) {
            setTwoFAMessage({
                type: 'error',
                text: error.response?.data?.error?.message || 'Failed to disable 2FA'
            });
        } finally {
            setToggling2FA(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-900 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8" data-tour="account-header">Account Settings</h1>

            <div className="max-w-2xl space-y-6">
                {/* Profile Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                            <User size={32} className="text-stone-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-stone-900">{user?.full_name || 'Admin'}</h2>
                            <p className="text-stone-500">{user?.email}</p>
                        </div>
                    </div>
                    <div className="text-sm text-stone-500">
                        Last login: {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-tour="change-password">
                    <button
                        onClick={() => setActiveSection(activeSection === 'password' ? null : 'password')}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Lock size={24} className="text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900">Change Password</h3>
                                <p className="text-sm text-stone-500">Update your account password</p>
                            </div>
                        </div>
                        <span className="text-stone-400">{activeSection === 'password' ? '▲' : '▼'}</span>
                    </button>

                    {activeSection === 'password' && (
                        <div className="border-t border-stone-100 p-6">
                            {passwordMessage.text && (
                                <div className={`p-3 rounded-xl mb-4 text-sm font-medium flex items-center gap-2 ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {passwordMessage.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                                    {passwordMessage.text}
                                </div>
                            )}
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-stone-700 mb-2 block">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                                        >
                                            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-stone-700 mb-2 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                                        >
                                            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-stone-400 mt-1">Must be at least 8 characters</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-stone-700 mb-2 block">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50"
                                >
                                    {changingPassword ? 'Changing...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Change Email */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <button
                        onClick={() => setActiveSection(activeSection === 'email' ? null : 'email')}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-stone-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Mail size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900">Change Email</h3>
                                <p className="text-sm text-stone-500">Update your login email address</p>
                            </div>
                        </div>
                        <span className="text-stone-400">{activeSection === 'email' ? '▲' : '▼'}</span>
                    </button>

                    {activeSection === 'email' && (
                        <div className="border-t border-stone-100 p-6">
                            {emailMessage.text && (
                                <div className={`p-3 rounded-xl mb-4 text-sm font-medium flex items-center gap-2 ${emailMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {emailMessage.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                                    {emailMessage.text}
                                </div>
                            )}
                            <form onSubmit={handleEmailChange} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-stone-700 mb-2 block">New Email Address</label>
                                    <input
                                        type="email"
                                        value={emailData.new_email}
                                        onChange={(e) => setEmailData({ ...emailData, new_email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-stone-700 mb-2 block">Confirm with Password</label>
                                    <input
                                        type="password"
                                        value={emailData.password}
                                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={changingEmail}
                                    className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50"
                                >
                                    {changingEmail ? 'Changing...' : 'Update Email'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user?.two_factor_enabled ? 'bg-green-100' : 'bg-stone-100'}`}>
                                <Shield size={24} className={user?.two_factor_enabled ? 'text-green-600' : 'text-stone-400'} />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-900">Two-Factor Authentication</h3>
                                <p className="text-sm text-stone-500">
                                    {user?.two_factor_enabled
                                        ? 'Enabled – verification codes sent to your email on login'
                                        : 'Add an extra layer of security to your account'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${user?.two_factor_enabled ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                            {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </div>
                    </div>

                    {twoFAMessage.text && (
                        <div className={`mx-6 mb-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${twoFAMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {twoFAMessage.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                            {twoFAMessage.text}
                        </div>
                    )}

                    <div className="border-t border-stone-100 p-6">
                        {user?.two_factor_enabled ? (
                            activeSection === '2fa' ? (
                                <form onSubmit={handleDisable2FA} className="space-y-4">
                                    <p className="text-sm text-stone-600 mb-4">Enter your password to disable 2FA:</p>
                                    <input
                                        type="password"
                                        value={disable2FAPassword}
                                        onChange={(e) => setDisable2FAPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
                                        required
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection(null)}
                                            className="flex-1 border border-stone-200 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={toggling2FA}
                                            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {toggling2FA ? 'Disabling...' : 'Disable 2FA'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setActiveSection('2fa')}
                                    className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50"
                                >
                                    Disable Two-Factor Authentication
                                </button>
                            )
                        ) : (
                            <button
                                onClick={handleEnable2FA}
                                disabled={toggling2FA}
                                className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
                            >
                                {toggling2FA ? 'Enabling...' : 'Enable Two-Factor Authentication'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAccount;
