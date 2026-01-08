import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/config';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('customer_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${getApiBaseUrl()}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('customer_token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${getApiBaseUrl()}/auth/login`, { email, password });
            const { token, user } = response.data.data;
            localStorage.setItem('customer_token', token);
            setUser(user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Login failed'
            };
        }
    };

    const loginWithGoogle = async (credential) => {
        try {
            const response = await axios.post(`${getApiBaseUrl()}/auth/google`, { credential });
            const { token, user } = response.data.data;
            localStorage.setItem('customer_token', token);
            setUser(user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Google login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${getApiBaseUrl()}/auth/register`, userData);
            const { token, user } = response.data.data;
            localStorage.setItem('customer_token', token);
            setUser(user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('customer_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <CustomerAuthContext.Provider value={{ user, loading, isAuthenticated, login, loginWithGoogle, register, logout }}>
            {children}
        </CustomerAuthContext.Provider>
    );
};
