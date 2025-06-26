import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* 404 Animation */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className="text-9xl font-bold text-primary mb-8"
        >
          404
        </motion.div>

        <h1 className="text-4xl font-bold mb-4">{t('errors.404')}</h1>
        <p className="text-xl text-base-content/60 mb-8">
          {t('errors.404Message')}
        </p>

        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            <FiHome />
            {t('nav.home')}
          </Link>
          <Link to="/search" className="btn btn-outline">
            <FiSearch />
            {t('common.search')}
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 relative">
          <motion.div
            animate={{
              x: [-100, 100, -100],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -left-20 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [100, -100, 100],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
            className="absolute -right-20 top-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
