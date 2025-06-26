import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiEdit3,
  FiUser,
  FiSettings,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
  FiSearch,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiGrid
} from 'react-icons/fi';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const navItems = user ? [
    { path: '/', label: t('nav.home'), icon: FiHome },
    { path: '/dashboard', label: t('nav.dashboard'), icon: FiGrid },
    { path: '/create-post', label: t('nav.createPost'), icon: FiEdit3 },
    { path: `/profile/${user._id}`, label: t('nav.profile'), icon: FiUser },
    { path: '/settings', label: t('nav.settings'), icon: FiSettings },
  ] : [
    { path: '/', label: t('nav.home'), icon: FiHome },
    { path: '/login', label: t('nav.login'), icon: FiLogIn },
    { path: '/register', label: t('nav.register'), icon: FiUserPlus },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <nav className="navbar bg-base-200 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-2xl font-bold text-primary hover:text-primary-focus transition-colors"
            >
              {t('common.appName')}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 flex-1 ml-8">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.searchPlaceholder')}
                    className="input input-bordered w-full pl-10 pr-4"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                </div>
              </form>

              {/* Nav Links */}
              <div className="flex items-center space-x-4">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center space-x-2 hover:text-primary transition-colors"
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn btn-ghost btn-circle"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              {/* Language Selector */}
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="select select-ghost select-sm"
              >
                <option value="en">EN</option>
                <option value="de">DE</option>
              </select>

              {/* User Menu or Auth Buttons */}
              {user ? (
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                      <img 
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`} 
                        alt={user.name} 
                      />
                    </div>
                  </label>
                  <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52">
                    <li className="menu-title">
                      <span>{user.name}</span>
                    </li>
                    <li><Link to={`/profile/${user._id}`}>{t('nav.profile')}</Link></li>
                    <li><Link to="/dashboard">{t('nav.dashboard')}</Link></li>
                    <li><Link to="/settings">{t('nav.settings')}</Link></li>
                    <li><button onClick={handleLogout}>{t('nav.logout')}</button></li>
                  </ul>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/login" className="btn btn-ghost btn-sm">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn-ghost btn-circle md:hidden"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-base-200 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.searchPlaceholder')}
                    className="input input-bordered w-full pl-10 pr-4"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                </div>
              </form>

              {/* Mobile Nav Links */}
              <ul className="menu menu-compact">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2"
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
                {user && (
                  <li>
                    <button onClick={handleLogout} className="flex items-center space-x-2">
                      <FiLogOut size={18} />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content mt-auto">
        <div>
          <p className="font-bold text-lg">{t('common.appName')}</p>
          <p className="text-sm opacity-75">
            © {new Date().getFullYear()} - All rights reserved
          </p>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="link link-hover">{t('footer.about')}</a>
          <a href="#" className="link link-hover">{t('footer.contact')}</a>
          <a href="#" className="link link-hover">{t('footer.privacy')}</a>
          <a href="#" className="link link-hover">{t('footer.terms')}</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
