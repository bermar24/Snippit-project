import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiLock,
  FiGlobe,
  FiBell,
  FiShield,
  FiTrash2,
  FiSave,
  FiEye,
  FiEyeOff, FiDroplet
} from 'react-icons/fi';

const SettingsSection = ({ icon: Icon, title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-200 shadow-xl"
    >
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Icon className="text-primary" />
          {title}
        </h2>
        {children}
      </div>
    </motion.div>
  );
};

const ThemePreview = ({ theme, isActive, onClick }) => {
  const colors = {
    light: { bg: '#FFFFFF', primary: '#3B82F6', text: '#1F2937' },
    dark: { bg: '#1F2937', primary: '#60A5FA', text: '#F9FAFB' },
    blue: { bg: '#EFF6FF', primary: '#1E40AF', text: '#1E3A8A' },
    green: { bg: '#ECFDF5', primary: '#059669', text: '#064E3B' },
    purple: { bg: '#F5F3FF', primary: '#7C3AED', text: '#4C1D95' }
  };

  const { bg, primary, text } = colors[theme] || colors.light;

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isActive ? 'border-primary scale-105' : 'border-base-300 hover:border-primary/50'
      }`}
      style={{ backgroundColor: bg }}
    >
      <div className="w-full h-20 flex flex-col gap-2">
        <div className="h-2 rounded" style={{ backgroundColor: primary }} />
        <div className="h-1 rounded w-3/4" style={{ backgroundColor: text, opacity: 0.3 }} />
        <div className="h-1 rounded w-1/2" style={{ backgroundColor: text, opacity: 0.3 }} />
      </div>
      {isActive && (
        <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full" />
      )}
    </button>
  );
};

const Settings = () => {
  const { user, updateUser, updatePassword } = useAuth();
  const { theme, themes, changeTheme, customTheme, updateCustomTheme } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    notifyComments: true,
    notifyLikes: true,
    notifyFollows: true
  });

  const [customColors, setCustomColors] = useState(customTheme || {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    'base-100': '#FFFFFF',
    'base-content': '#1F2937'
  });

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateUser(accountData);
    if (result.success) {
      toast.success(t('success.profileUpdated'));
    }
    
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('errors.passwordsDontMatch'));
      return;
    }
    
    setLoading(true);
    const result = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    
    setLoading(false);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    updateUser({ language: lang });
  };

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    updateUser({ theme: newTheme });
  };

  const handleCustomThemeUpdate = () => {
    updateCustomTheme(customColors);
    handleThemeChange('custom');
    toast.success('Custom theme applied');
  };

  const tabs = [
    { id: 'account', label: t('settings.account'), icon: FiUser },
    { id: 'preferences', label: t('settings.preferences'), icon: FiDroplet },
    { id: 'notifications', label: t('settings.notifications'), icon: FiBell },
    { id: 'security', label: t('settings.privacy'), icon: FiShield }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab gap-2 ${activeTab === id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'account' && (
        <SettingsSection icon={FiUser} title={t('settings.account')}>
          <form onSubmit={handleAccountUpdate} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.name')}</span>
              </label>
              <input
                type="text"
                value={accountData.name}
                onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth.email')}</span>
              </label>
              <input
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('profile.bio')}</span>
              </label>
              <textarea
                value={accountData.bio}
                onChange={(e) => setAccountData({ ...accountData, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                maxLength={500}
              />
              <label className="label">
                <span className="label-text-alt">{accountData.bio.length}/500</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <FiSave />
                  {t('common.save')}
                </>
              )}
            </button>
          </form>
        </SettingsSection>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Theme Settings */}
          <SettingsSection icon={FiDroplet} title={t('settings.theme')}>
            <div className="space-y-4">
              <p className="text-base-content/70">Choose your preferred theme</p>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {themes.map((themeName) => (
                  <div key={themeName} className="text-center">
                    <ThemePreview
                      theme={themeName}
                      isActive={theme === themeName}
                      onClick={() => handleThemeChange(themeName)}
                    />
                    <p className="text-sm mt-2">{t(`themes.${themeName}`)}</p>
                  </div>
                ))}
              </div>

              {/* Custom Theme */}
              <div className="divider">Custom Theme</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="form-control">
                    <label className="label">
                      <span className="label-text capitalize">{key.replace('-', ' ')}</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                        className="input input-bordered flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCustomThemeUpdate}
                className="btn btn-primary"
              >
                Apply Custom Theme
              </button>
            </div>
          </SettingsSection>

          {/* Language Settings */}
          <SettingsSection icon={FiGlobe} title={t('settings.language')}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select your preferred language</span>
              </label>
              <select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="select select-bordered"
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </SettingsSection>
        </div>
      )}

      {activeTab === 'notifications' && (
        <SettingsSection icon={FiBell} title={t('settings.notifications')}>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('settings.emailNotifications')}</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: e.target.checked
                  })}
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            <div className={`space-y-3 pl-4 ${!notificationSettings.emailNotifications ? 'opacity-50' : ''}`}>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('settings.notifyComments')}</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyComments}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      notifyComments: e.target.checked
                    })}
                    disabled={!notificationSettings.emailNotifications}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('settings.notifyLikes')}</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyLikes}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      notifyLikes: e.target.checked
                    })}
                    disabled={!notificationSettings.emailNotifications}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('settings.notifyFollows')}</span>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyFollows}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      notifyFollows: e.target.checked
                    })}
                    disabled={!notificationSettings.emailNotifications}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>
            </div>

            <button className="btn btn-primary">
              <FiSave />
              Save Notification Settings
            </button>
          </div>
        </SettingsSection>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <SettingsSection icon={FiLock} title={t('settings.changePassword')}>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('settings.currentPassword')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input input-bordered w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('settings.newPassword')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input input-bordered w-full pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('settings.confirmNewPassword')}</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input input-bordered"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  t('auth.updatePassword')
                )}
              </button>
            </form>
          </SettingsSection>

          {/* Delete Account */}
          <SettingsSection icon={FiTrash2} title={t('settings.deleteAccount')}>
            <div className="alert alert-warning mb-4">
              <span>{t('settings.deleteAccountWarning')}</span>
            </div>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error"
            >
              <FiTrash2 />
              {t('settings.deleteAccount')}
            </button>
          </SettingsSection>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{t('settings.deleteAccount')}</h3>
            <p className="text-error mb-4">{t('settings.deleteAccountWarning')}</p>
            <p>Type "DELETE" to confirm:</p>
            <input
              type="text"
              placeholder="DELETE"
              className="input input-bordered w-full mt-2"
            />
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost"
              >
                {t('common.cancel')}
              </button>
              <button className="btn btn-error">
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
