import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiClock,
  FiEye,
  FiHeart,
  FiBookmark,
  FiShare2,
  FiEdit,
  FiTrash2,
  FiMessageCircle,
  FiSend
} from 'react-icons/fi';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon
} from 'react-share';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CommentSection from '../components/blog/CommentSection';

const PostDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch post
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await axios.get(`/posts/${slug}`);
      return response.data.data;
    }
  });

  console.dir(post);
  

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(`/posts/${post._id}/like`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['post', slug], (oldData) => ({
        ...oldData,
        likes: data.liked 
          ? [...(oldData.likes || []), user._id]
          : oldData.likes.filter(id => id !== user._id),
        likeCount: data.likeCount
      }));
    }
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(`/users/bookmark/${post._id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.bookmarked ? 'Post bookmarked' : 'Bookmark removed');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/posts/${post._id}`);
    },
    onSuccess: () => {
      toast.success(t('success.postDeleted'));
      navigate('/');
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error">{t('errors.404Message')}</div>;

  const isAuthor = user && post.author._id === user._id;
  const isLiked = user && post.likes?.includes(user._id);
  const shareUrl = window.location.href;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-8 -mx-4 md:mx-0">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Category & Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="badge badge-primary badge-lg">
            {t(`categories.${post.category.toLowerCase()}`)}
          </span>
          {post.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/search?tags=${tag}`}
              className="badge badge-ghost badge-lg"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

        {/* Author Info & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to={`/profile/${post.author._id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="avatar">
              <div className="w-12 rounded-full">
                <img
                    src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`}
                    alt={post.author.name}
                />
              </div>
            </div>
            <div>
              <p className="font-semibold">{post.author.name}</p>
              <p className="text-sm text-base-content/60">
                {format(new Date(post.publishedAt || post.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-sm text-base-content/60">
            <span className="flex items-center gap-1">
              <FiClock /> {post.readingTime} {t('post.readingTime', { minutes: post.readingTime })}
            </span>
            <span className="flex items-center gap-1">
              <FiEye /> {post.views}
            </span>
            <span className="flex items-center gap-1">
              <FiMessageCircle /> {post.comments?.length || 0}
            </span>
          </div>
        </div>
      </header>

      {/* Actions Bar */}
      <div className="flex items-center justify-between py-4 mb-8 border-y border-base-300">
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={() => user ? likeMutation.mutate() : navigate('/login')}
            className={`btn btn-sm ${isLiked ? 'btn-primary' : 'btn-ghost'}`}
            disabled={likeMutation.isPending}
          >
            <FiHeart className={isLiked ? 'fill-current' : ''} />
            <span>{post.likeCount || 0}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => user ? bookmarkMutation.mutate() : navigate('/login')}
            className="btn btn-sm btn-ghost"
            disabled={bookmarkMutation.isPending}
          >
            <FiBookmark />
          </button>

          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="btn btn-sm btn-ghost"
          >
            <FiShare2 />
          </button>
        </div>

        {/* Author Actions */}
        {isAuthor && (
          <div className="flex items-center gap-2">
            <Link
              to={`/edit-post/${post._id}`}
              className="btn btn-sm btn-ghost"
            >
              <FiEdit />
              {t('common.edit')}
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-sm btn-error btn-ghost"
            >
              <FiTrash2 />
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Author Bio */}
      {post.author.bio && (
        <div className="bg-base-200 rounded-lg p-6 mb-12">
          <h3 className="text-lg font-semibold mb-3">About the Author</h3>
          <div className="flex items-start gap-4">
            <Link to={`/profile/${post.author._id}`}>
              <div className="avatar">
                <div className="w-16 rounded-full">
                  <img
                      src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`}
                      alt={post.author.name}
                  />
                </div>
              </div>
            </Link>
            <div className="flex-1">
              <Link
                to={`/profile/${post.author._id}`}
                className="font-semibold hover:text-primary"
              >
                {post.author.name}
              </Link>
              <p className="text-base-content/70 mt-1">{post.author.bio}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {post.commentsEnabled && (
        <CommentSection postId={post._id} />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{t('post.sharePost')}</h3>
            <div className="flex gap-4 justify-center">
              <FacebookShareButton url={shareUrl} quote={post.title}>
                <FacebookIcon size={48} round />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={post.title}>
                <TwitterIcon size={48} round />
              </TwitterShareButton>
              <LinkedinShareButton url={shareUrl} title={post.title}>
                <LinkedinIcon size={48} round />
              </LinkedinShareButton>
            </div>
            <div className="modal-action">
              <button
                onClick={() => setShowShareModal(false)}
                className="btn"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Delete Post</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="modal-action">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="btn btn-error"
              >
                {deleteMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  t('common.delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.article>
  );
};

export default PostDetail;



