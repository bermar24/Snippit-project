import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext({});

// Set axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add token to requests if it exists
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if user is logged in on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      toast.success(t('success.loginSuccess'));
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('errors.networkError');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      toast.success(t('success.registerSuccess'));
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('errors.networkError');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success(t('success.logoutSuccess'));
    navigate('/');
  };

  const updateUser = async (updates) => {
    try {
      const response = await axios.put('/auth/updatedetails', updates);
      setUser(response.data.data);
      toast.success(t('success.profileUpdated'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('errors.networkError');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/auth/updatepassword', { currentPassword, newPassword });
      toast.success(t('success.passwordChanged'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('errors.networkError');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/auth/forgotpassword', { email });
      toast.success(t('auth.resetSuccess'));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('errors.networkError');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.put(`/auth/resetpassword/${token}`, { password });
      const { token: authToken, user } = response.data;
      
      localStorage.setItem('token', authToken);
      setUser(user);
      
      toast.success(t('success.passwordChanged'));
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || t('errors.networkError');
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updatePassword,
    forgotPassword,
    resetPassword,
    checkUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
