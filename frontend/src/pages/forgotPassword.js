import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await forgotPassword(email);
    
    if (result.success) {
      setSuccess(true);
    }
    
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
          {!success ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">{t('auth.resetPasswordTitle')}</h1>
                <p className="text-base-content/60 mt-2">{t('auth.resetPasswordSubtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t('auth.email')}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input input-bordered w-full pl-10"
                      required
                    />
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    t('auth.sendResetLink')
                  )}
                </button>
              </form>

              <Link
                to="/login"
                className="btn btn-ghost btn-sm w-full mt-4"
              >
                <FiArrowLeft />
                {t('auth.backToLogin')}
              </Link>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-success text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-4">{t('auth.resetSuccess')}</h2>
              <p className="text-base-content/60 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn btn-primary">
                {t('auth.backToLogin')}
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
