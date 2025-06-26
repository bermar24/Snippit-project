import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const spinner = (
    <motion.div
      className={`${sizes[size]} relative`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 border-4 border-base-300 rounded-full" />
      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full" />
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
