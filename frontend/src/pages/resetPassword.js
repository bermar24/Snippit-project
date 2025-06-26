import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('errors.passwordsDontMatch'));
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }
    
    setLoading(true);
    await resetPassword(token, formData.password);
    setLoading(false);
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
            <h1 className="text-3xl font-bold">{t('auth.resetPasswordTitle')}</h1>
            <p className="text-base-content/60 mt-2">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.newPassword')}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 pr-10"
                  required
                  minLength={6}
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
            </div>

            {/* Confirm Password */}
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
                  className="input input-bordered w-full pl-10 pr-10"
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
                t('auth.updatePassword')
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/login" className="link link-primary text-sm">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
