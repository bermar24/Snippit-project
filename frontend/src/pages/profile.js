import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiCalendar,
  FiEdit2,
  FiUserPlus,
  FiUserMinus,
  FiFileText,
  FiUsers,
  FiHeart,
  FiEye
} from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfileStats = ({ icon: Icon, label, value }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">
        <Icon className="text-2xl text-primary" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-base-content/60">{label}</p>
    </div>
  );
};

const PostCard = ({ post }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all"
    >
      {post.featuredImage && (
        <figure className="aspect-video">
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </figure>
      )}
      
      <div className="card-body">
        <h3 className="card-title line-clamp-2">
          <Link to={`/posts/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        
        <p className="text-base-content/70 line-clamp-2">{post.excerpt}</p>
        
        <div className="flex items-center gap-4 mt-4 text-sm text-base-content/60">
          <span className="flex items-center gap-1">
            <FiEye /> {post.views}
          </span>
          <span className="flex items-center gap-1">
            <FiHeart /> {post.likeCount || 0}
          </span>
          <span>
            {format(new Date(post.publishedAt || post.createdAt), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [page, setPage] = useState(1);

  const isOwnProfile = currentUser && currentUser._id === userId;

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const response = await axios.get(`/users/${userId}`);
      return response.data.data;
    }
  });

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', userId, page],
    queryFn: async () => {
      const response = await axios.get(`/posts/user/${userId}?page=${page}&limit=9`);
      return response.data;
    },
    enabled: activeTab === 'posts'
  });

  // Fetch followers
  const { data: followersData } = useQuery({
    queryKey: ['user-followers', userId],
    queryFn: async () => {
      const response = await axios.get(`/users/${userId}/followers`);
      return response.data.data;
    },
    enabled: activeTab === 'followers'
  });

  // Fetch following
  const { data: followingData } = useQuery({
    queryKey: ['user-following', userId],
    queryFn: async () => {
      const response = await axios.get(`/users/${userId}/following`);
      return response.data.data;
    },
    enabled: activeTab === 'following'
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(`/users/follow/${userId}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile', userId]);
      queryClient.invalidateQueries(['user-followers', userId]);
      toast.success(data.following ? 'Following user' : 'Unfollowed user');
    }
  });

  if (profileLoading) return <LoadingSpinner />;
  if (!profile) return <div className="text-center">{t('errors.404Message')}</div>;
  const isFollowing = currentUser && profile.followers.some(follower => follower._id === currentUser._id);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-200 shadow-xl mb-8"
      >
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="avatar">
              <div className="w-32 h-32 rounded-full">
                <img
                  src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&size=256`}
                  alt={profile.name}
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                
                {isOwnProfile ? (
                  <Link to="/edit-profile" className="btn btn-primary btn-sm">
                    <FiEdit2 />
                    {t('profile.editProfile')}
                  </Link>
                ) : currentUser && (
                  <button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={`btn btn-sm ${isFollowing ? 'btn-ghost' : 'btn-primary'}`}
                  >
                    {followMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : isFollowing ? (
                      <>
                        <FiUserMinus />
                        {t('profile.unfollow')}
                      </>
                    ) : (
                      <>
                        <FiUserPlus />
                        {t('profile.follow')}
                      </>
                    )}
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-base-content/80 mb-4 max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <FiCalendar />
                <span>{t('profile.joinedOn', { date: format(new Date(profile.createdAt), 'MMMM yyyy') })}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <ProfileStats
                icon={FiFileText}
                label={t('profile.posts')}
                value={profile.postCount || 0}
              />
              <ProfileStats
                icon={FiUsers}
                label={t('profile.followers')}
                value={profile.followerCount || 0}
              />
              <ProfileStats
                icon={FiUsers}
                label={t('profile.following')}
                value={profile.followingCount || 0}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-8">
        <button
          className={`tab ${activeTab === 'posts' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          {t('profile.posts')} ({profile.postCount || 0})
        </button>
        <button
          className={`tab ${activeTab === 'followers' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          {t('profile.followers')} ({profile.followerCount || 0})
        </button>
        <button
          className={`tab ${activeTab === 'following' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          {t('profile.following')} ({profile.followingCount || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <>
          {postsLoading ? (
            <LoadingSpinner />
          ) : postsData?.data?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-base-content/60">{t('profile.noPosts')}</p>
              {isOwnProfile && (
                <Link to="/create-post" className="btn btn-primary mt-4">
                  {t('post.createYourFirst')}
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postsData.data.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {postsData.pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="join">
                    <button
                      className="join-item btn"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      «
                    </button>
                    
                    {[...Array(Math.min(5, postsData.pagination.pages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          className={`join-item btn ${page === pageNum ? 'btn-active' : ''}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      className="join-item btn"
                      disabled={page === postsData.pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'followers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followersData?.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-xl text-base-content/60">{t('profile.noFollowers')}</p>
            </div>
          ) : (
            followersData?.map(follower => (
              <motion.div
                key={follower._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-base-200"
              >
                <div className="card-body p-4">
                  <Link
                    to={`/profile/${follower._id}`}
                    className="flex items-center gap-4 hover:opacity-80"
                  >
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img
                          src={follower.avatarUrl || `https://ui-avatars.com/api/?name=${follower.name}`}
                          alt={follower.name}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{follower.name}</p>
                      {follower.bio && (
                        <p className="text-sm text-base-content/60 line-clamp-1">{follower.bio}</p>
                      )}
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'following' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followingData?.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-xl text-base-content/60">{t('profile.noFollowing')}</p>
            </div>
          ) : (
            followingData?.map(following => (
              <motion.div
                key={following._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-base-200"
              >
                <div className="card-body p-4">
                  <Link
                    to={`/profile/${following._id}`}
                    className="flex items-center gap-4 hover:opacity-80"
                  >
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img
                          src={following.avatarUrl || `https://ui-avatars.com/api/?name=${following.name}`}
                          alt={following.name}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{following.name}</p>
                      {following.bio && (
                        <p className="text-sm text-base-content/60 line-clamp-1">{following.bio}</p>
                      )}
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
