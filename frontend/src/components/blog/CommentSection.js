import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiHeart, FiMessageCircle, FiEdit2, FiTrash2, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Comment = ({ comment, postId, onReply }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = user && comment.author._id === user._id;
  const isLiked = user && comment.likes?.includes(user._id);

  // Like comment mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(`/comments/${comment._id}/like`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
    }
  });

  // Update comment mutation
  const updateMutation = useMutation({
    mutationFn: async (content) => {
      const response = await axios.put(`/comments/${comment._id}`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      setIsEditing(false);
      toast.success('Comment updated');
    }
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/comments/${comment._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      toast.success(t('comment.commentDeleted'));
    }
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    if (editContent.trim() && editContent !== comment.content) {
      updateMutation.mutate(editContent);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${comment.parentComment ? 'ml-12' : ''}`}
    >
      <div className="bg-base-200 rounded-lg p-4 mb-4">
        {/* Comment Header */}
        <div className="flex items-start gap-3">
          <Link to={`/profile/${comment.author._id}`}>
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${comment.author.name}`}
                  alt={comment.author.name}
                />
              </div>
            </div>
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/profile/${comment.author._id}`}
                className="font-semibold hover:text-primary"
              >
                {comment.author.name}
              </Link>
              <span className="text-sm text-base-content/50">
                {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
              </span>
              {comment.edited && (
                <span className="text-xs text-base-content/50">(edited)</span>
              )}
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <form onSubmit={handleUpdate} className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows="3"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn btn-primary btn-sm"
                  >
                    {updateMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      t('common.save')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-base-content/80">{comment.content}</p>
            )}

            {/* Comment Actions */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => likeMutation.mutate()}
                disabled={!user || likeMutation.isPending}
                className={`btn btn-ghost btn-xs gap-1 ${isLiked ? 'text-primary' : ''}`}
              >
                <FiHeart className={isLiked ? 'fill-current' : ''} />
                <span>{comment.likeCount || 0}</span>
              </button>

              {!comment.parentComment && (
                <button
                  onClick={() => onReply(comment._id, comment.author.name)}
                  disabled={!user}
                  className="btn btn-ghost btn-xs gap-1"
                >
                  <FiMessageCircle />
                  {t('comment.reply')}
                </button>
              )}

              {isAuthor && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <FiEdit2 />
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="btn btn-ghost btn-xs gap-1 text-error"
                  >
                    <FiTrash2 />
                    {t('common.delete')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <>
          {!comment.parentComment && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="btn btn-ghost btn-xs mb-2 ml-12"
            >
              {showReplies
                ? t('comment.hideReplies')
                : t('comment.showReplies', { count: comment.replies.length })}
            </button>
          )}
          
          <AnimatePresence>
            {(showReplies || comment.parentComment) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    postId={postId}
                    onReply={onReply}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyToName, setReplyToName] = useState('');

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await axios.get(`/comments/post/${postId}`);
      return response.data.data;
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('/comments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      setCommentText('');
      setReplyTo(null);
      setReplyToName('');
      toast.success(t('comment.commentPosted'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    
    if (commentText.trim()) {
      createCommentMutation.mutate({
        content: commentText,
        post: postId,
        parentComment: replyTo
      });
    }
  };

  const handleReply = (commentId, authorName) => {
    setReplyTo(commentId);
    setReplyToName(authorName);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Filter top-level comments
  const topLevelComments = comments?.filter(c => !c.parentComment) || [];

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        {t('comment.title')} ({comments?.length || 0})
      </h2>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="bg-base-200 rounded p-2 mb-2 flex items-center justify-between">
              <span className="text-sm">
                Replying to <strong>{replyToName}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setReplyToName('');
                }}
                className="btn btn-ghost btn-xs"
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="flex gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                  alt={user.name}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('comment.writeComment')}
                className="textarea textarea-bordered w-full"
                rows="3"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || createCommentMutation.isPending}
                className="btn btn-primary btn-sm mt-2"
              >
                {createCommentMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <FiSend />
                    {t('comment.postComment')}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-base-200 rounded-lg p-6 text-center mb-8">
          <p className="mb-4">{t('comment.beFirstToComment')}</p>
          <Link to="/login" className="btn btn-primary btn-sm">
            {t('nav.login')}
          </Link>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : comments?.length === 0 ? (
        <div className="text-center py-8 text-base-content/60">
          <p>{t('comment.noComments')}</p>
        </div>
      ) : (
        <div>
          {topLevelComments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentSection;
