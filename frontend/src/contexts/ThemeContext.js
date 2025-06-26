import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({});

const themes = {
  light: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    neutral: '#374151',
    'base-100': '#FFFFFF',
    'base-200': '#F3F4F6',
    'base-300': '#E5E7EB',
    'base-content': '#1F2937',
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#A78BFA',
    accent: '#FCD34D',
    neutral: '#D1D5DB',
    'base-100': '#1F2937',
    'base-200': '#111827',
    'base-300': '#374151',
    'base-content': '#F9FAFB',
  },
  blue: {
    primary: '#1E40AF',
    secondary: '#3730A3',
    accent: '#0891B2',
    neutral: '#4B5563',
    'base-100': '#EFF6FF',
    'base-200': '#DBEAFE',
    'base-300': '#BFDBFE',
    'base-content': '#1E3A8A',
  },
  green: {
    primary: '#059669',
    secondary: '#047857',
    accent: '#0D9488',
    neutral: '#4B5563',
    'base-100': '#ECFDF5',
    'base-200': '#D1FAE5',
    'base-300': '#A7F3D0',
    'base-content': '#064E3B',
  },
  purple: {
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#EC4899',
    neutral: '#4B5563',
    'base-100': '#F5F3FF',
    'base-200': '#EDE9FE',
    'base-300': '#DDD6FE',
    'base-content': '#4C1D95',
  }
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or user preference
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || user?.theme || 'light';
  });
  
  const [customTheme, setCustomTheme] = useState(() => {
    const saved = localStorage.getItem('customTheme');
    return saved ? JSON.parse(saved) : null;
  });

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme, customTheme);
  }, [theme, customTheme]);

  // Sync with user preference when user changes
  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme);
      if (user.customTheme) {
        setCustomTheme(user.customTheme);
      }
    }
  }, [user]);

  const applyTheme = (themeName, custom = null) => {
    const root = document.documentElement;
    const colors = themeName === 'custom' && custom ? custom : themes[themeName] || themes.light;
    
    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Set data-theme for DaisyUI
    root.setAttribute('data-theme', themeName === 'custom' ? 'light' : themeName);
    
    // Add theme class to body
    document.body.className = `theme-${themeName}`;
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme !== 'custom') {
      setCustomTheme(null);
      localStorage.removeItem('customTheme');
    }
  };

  const updateCustomTheme = (colors) => {
    setCustomTheme(colors);
    localStorage.setItem('customTheme', JSON.stringify(colors));
    
    if (theme === 'custom') {
      applyTheme('custom', colors);
    }
  };

  const getThemeColors = () => {
    if (theme === 'custom' && customTheme) {
      return customTheme;
    }
    return themes[theme] || themes.light;
  };

  const value = {
    theme,
    themes: Object.keys(themes),
    currentColors: getThemeColors(),
    changeTheme,
    customTheme,
    updateCustomTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
