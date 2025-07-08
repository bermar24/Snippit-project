import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiImage, FiX, FiSave, FiSend } from 'react-icons/fi';
import RichTextEditor from '../components/editor/RichTextEditor';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditPost = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Other',
    tags: [],
    status: 'draft',
    featuredImage: null
  });
  
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

  const categories = [
    'Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Health', 'Entertainment', 'Other'
  ];

  // Fetch post data
  const { data: post, isLoading } = useQuery({
    queryKey: ['post-edit', id],
    queryFn: async () => {
      const response = await axios.get(`posts/id/${id}`);
      return response.data.data;
    },
    onSuccess: (data) => {
      setFormData({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        category: data.category,
        tags: data.tags || [],
        status: data.status,
        featuredImage: data.featuredImage
      });
      setImagePreview(data.featuredImage);
    }
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (data) => {
      // First update the post
      const response = await axios.put(`posts/${id}`, data);

      // Then upload new image if changed
      if (imageFile && imageChanged) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await axios.post(`posts/${id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(t('success.postUpdated'));
      navigate(`/posts/${data.data.slug}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('errors.networkError'));
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      setImageFile(file);
      setImageChanged(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageChanged(true);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = (status) => {
    if (!formData.title.trim()) {
      toast.error('Please add a title');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Please add some content');
      return;
    }
    
    updatePostMutation.mutate({
      ...formData,
      status
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <div className="text-center">{t('errors.404Message')}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8">{t('common.edit')} {t('post.title')}</h1>

      <div className="space-y-6">
        {/* Title */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('post.title')}</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your post title..."
            className="input input-bordered input-lg w-full"
            maxLength={200}
          />
          <label className="label">
            <span className="label-text-alt">{formData.title.length}/200</span>
          </label>
        </div>

        {/* Featured Image */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('post.featuredImage')}</span>
          </label>
          
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:bg-base-200 transition-colors">
              <FiImage className="text-4xl text-base-content/50 mb-2" />
              <span className="text-base-content/70">Click to upload image</span>
              <span className="text-sm text-base-content/50 mt-1">Max size: 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Featured"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-4">
                <label className="btn btn-primary btn-sm cursor-pointer">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={removeImage}
                  className="btn btn-error btn-sm"
                >
                  <FiX />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('post.category')}</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {t(`categories.${cat.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('post.tags')}</span>
          </label>
          <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              className="input input-bordered flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="badge badge-lg gap-2">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-base-content/50 hover:text-base-content"
                >
                  <FiX />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Excerpt */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('post.excerpt')}</span>
            <span className="label-text-alt">Optional</span>
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description of your post..."
            className="textarea textarea-bordered h-24"
            maxLength={300}
          />
          <label className="label">
            <span className="label-text-alt">{formData.excerpt.length}/300</span>
          </label>
        </div>

        {/* Content */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-lg font-semibold">{t('post.content')}</span>
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={handleContentChange}
            placeholder="Start writing your amazing post..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={updatePostMutation.isPending}
            className="btn btn-outline"
          >
            <FiSave className="mr-2" />
            {t('post.saveDraft')}
          </button>
          <button
            onClick={() => handleSubmit(formData.status === 'published' ? 'published' : 'published')}
            disabled={updatePostMutation.isPending}
            className="btn btn-primary"
          >
            {updatePostMutation.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <FiSend className="mr-2" />
                {formData.status === 'published' ? t('common.update') : t('post.publish')}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EditPost;
