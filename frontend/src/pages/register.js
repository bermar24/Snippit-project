import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('errors.requiredField');
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('errors.requiredField');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('errors.requiredField');
    } else if (formData.password.length < 6) {
      newErrors.password = t('errors.passwordTooShort');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.requiredField');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordsDontMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card w-full max-w-md bg-base-200 shadow-2xl"
      >
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">{t('auth.registerTitle')}</h1>
            <p className="text-base-content/60 mt-2">{t('auth.registerSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.name')}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
                  required
                />
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              </div>
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name}</span>
                </label>
              )}
            </div>

            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.email')}</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                  required
                />
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.password')}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  required
                />
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.confirmPassword')}</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  required
                />
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                t('auth.registerButton')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">{t('auth.orContinueWith')}</div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="btn btn-outline w-full"
          >
            <FcGoogle className="text-xl" />
            {t('auth.googleLogin')}
          </button>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="link link-primary font-semibold">
              {t('nav.login')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
