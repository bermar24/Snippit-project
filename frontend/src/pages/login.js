import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
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
            <h1 className="text-3xl font-bold">{t('auth.loginTitle')}</h1>
            <p className="text-base-content/60 mt-2">{t('auth.loginSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="input input-bordered w-full pl-10"
                  required
                />
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.password')}</span>
                <Link 
                  to="/forgot-password" 
                  className="label-text-alt link link-hover text-primary"
                >
                  {t('auth.forgotPassword')}
                </Link>
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

            {/* Remember Me */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('auth.rememberMe')}</span>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
              </label>
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
                t('auth.loginButton')
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

          {/* Register Link */}
          <p className="text-center mt-6 text-sm">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="link link-primary font-semibold">
              {t('nav.register')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
