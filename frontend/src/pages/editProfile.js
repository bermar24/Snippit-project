import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCamera, FiSave, FiX } from 'react-icons/fi';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);
  const [loading, setLoading] = useState(false);

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/avatar`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Avatar updated successfully');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload avatar if changed
      if (avatarFile) {
        await uploadAvatarMutation.mutateAsync(avatarFile);
      }

      // Update profile
      const result = await updateUser(formData);
      
      if (result.success) {
        navigate(`/profile/${user._id}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8">{t('profile.editProfile')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('profile.updateAvatar')}</span>
          </label>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="avatar">
                <div className="w-32 h-32 rounded-full">
                  <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.name}&size=256`}
                    alt="Avatar preview"
                  />
                </div>
              </div>
              
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FiCamera className="text-white text-2xl" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="text-sm text-base-content/60">
              <p>Click on the avatar to upload a new image</p>
              <p>Maximum size: 5MB</p>
              <p>Recommended: Square image, at least 256x256px</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('auth.name')}</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('auth.email')}</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>

        {/* Bio */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('profile.bio')}</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            className="textarea textarea-bordered h-32"
            maxLength={500}
          />
          <label className="label">
            <span className="label-text-alt">{formData.bio.length}/500</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
          >
            {t('common.cancel')}
          </button>
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
        </div>
      </form>
    </motion.div>
  );
};

export default EditProfile;
