import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { FiClock, FiEye, FiHeart, FiMessageCircle, FiFilter } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const PostCard = ({ post }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
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
        {/* Category & Tags */}
        <div className="flex items-center gap-2 text-sm">
          <span className="badge badge-primary">{t(`categories.${post.category.toLowerCase()}`)}</span>
          {post.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="badge badge-ghost">{tag}</span>
          ))}
        </div>

        {/* Title */}
        <h2 className="card-title text-2xl hover:text-primary transition-colors">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>

        {/* Excerpt */}
        <p className="text-base-content/70 line-clamp-3">{post.excerpt}</p>

        {/* Author & Date */}
        <div className="flex items-center gap-4 mt-4">
          <Link 
            to={`/profile/${post.author._id}`}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <div className="avatar">
              <div className="w-8 rounded-full">
                <img 
                  src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`} 
                  alt={post.author.name}
                />
              </div>
            </div>
            <span className="font-medium">{post.author.name}</span>
          </Link>
          <span className="text-sm text-base-content/50">
            {format(new Date(post.publishedAt || post.createdAt), 'MMM dd, yyyy')}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm text-base-content/60">
          <span className="flex items-center gap-1">
            <FiClock /> {post.readingTime} {t('post.readingTime', { minutes: post.readingTime })}
          </span>
          <span className="flex items-center gap-1">
            <FiEye /> {post.views}
          </span>
          <span className="flex items-center gap-1">
            <FiHeart /> {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <FiMessageCircle /> {post.comments?.length || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('-publishedAt');
    const { user } = useAuth();
  

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', page, category, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit: 12,
        status: 'published',
        sortBy
      });
      
      if (category) params.append('category', category);
      
      const response = await axios.get(`/posts?${params}`);
      return response.data;
    }
  });

  const categories = [
    'Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Health', 'Entertainment', 'Other'
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error">{t('common.error')}</div>;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hero bg-gradient-to-r from-primary to-secondary text-primary-content rounded-3xl p-12"
      >
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">{t('common.appName')}</h1>
            <p className="text-xl mb-8">
              Discover amazing stories, share your thoughts, and connect with a community of writers and readers.
            </p>
           { !user && <Link to="/register" className="btn btn-lg btn-accent">
              {t('auth.registerButton')}
            </Link>}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-base-200 p-4 rounded-lg">
        <FiFilter className="text-xl" />
        
        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select select-bordered select-sm"
        >
          <option value="">{t('search.filterByCategory')}</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {t(`categories.${cat.toLowerCase()}`)}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="select select-bordered select-sm"
        >
          <option value="-publishedAt">{t('search.sortByDate')}</option>
          <option value="-views">{t('search.sortByPopularity')}</option>
          <option value="-likeCount">Most Liked</option>
        </select>

        {category && (
          <button
            onClick={() => setCategory('')}
            className="btn btn-ghost btn-sm"
          >
            {t('search.clearFilters')}
          </button>
        )}
      </div>

      {/* Posts Grid */}
      {data?.data?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-base-content/60">{t('post.noPostsFound')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <button
                  className="join-item btn"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  «
                </button>
                
                {[...Array(Math.min(5, data.pagination.pages))].map((_, i) => {
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
                  disabled={page === data.pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
