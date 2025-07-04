import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { FiSearch, FiFilter, FiClock, FiEye, FiHeart, FiMessageCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  
  const query = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialTags = searchParams.get('tags') || '';
  const initialAuthor = searchParams.get('author') || '';
  
  const [filters, setFilters] = useState({
    category: initialCategory,
    tags: initialTags,
    author: initialAuthor,
    sortBy: '-publishedAt'
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Health', 'Entertainment', 'Other'
  ];

  // Fetch search results
  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: query,
        status: 'published',
        sortBy: filters.sortBy
      });
      
      if (filters.category) params.append('category', filters.category);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.author) params.append('author', filters.author);
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts?${params}`);
      return response.data;
    },
    enabled: !!query
  });

  // Fetch popular tags for filter
  const { data: popularTags } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/interactions/tags/popular?limit=10`);
      return response.data.data;
    }
  });

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      tags: '',
      author: '',
      sortBy: '-publishedAt'
    });
    
    const newParams = new URLSearchParams();
    newParams.set('q', query);
    setSearchParams(newParams);
  };

  const hasActiveFilters = filters.category || filters.tags || filters.author;

  if (!query) {
    return (
      <div className="text-center py-12">
        <FiSearch className="text-6xl text-base-content/30 mx-auto mb-4" />
        <p className="text-xl text-base-content/60">Enter a search term to get started</p>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-error">{t('common.error')}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('search.resultsFor', { query })}
        </h1>
        <p className="text-base-content/60">
          {data?.total || 0} results found
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}
        >
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title text-lg">
                  <FiFilter />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost btn-xs"
                  >
                    {t('search.clearFilters')}
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">{t('common.sort')}</span>
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="-publishedAt">{t('search.sortByDate')}</option>
                  <option value="-views">{t('search.sortByPopularity')}</option>
                  <option value="-likeCount">Most Liked</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">{t('search.filterByCategory')}</span>
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">{t('search.filterByTags')}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularTags?.map(({ tag, count }) => (
                    <button
                      key={tag}
                      onClick={() => handleFilterChange('tags', filters.tags === tag ? '' : tag)}
                      className={`badge ${filters.tags === tag ? 'badge-primary' : 'badge-ghost'} cursor-pointer`}
                    >
                      {tag} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Search Results */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm mb-4 lg:hidden"
          >
            <FiFilter />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {data?.data?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-xl text-base-content/60 mb-4">{t('search.noResults')}</p>
              <p className="text-base-content/50">{t('search.tryDifferentKeywords')}</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {data?.data?.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Featured Image */}
                      {post.featuredImage && (
                        <Link to={`/posts/${post.slug}`} className="flex-shrink-0">
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full md:w-48 h-32 object-cover rounded-lg"
                          />
                        </Link>
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        {/* Category & Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="badge badge-primary">
                            {t(`categories.${post.category.toLowerCase()}`)}
                          </span>
                          {post.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="badge badge-ghost badge-sm">{tag}</span>
                          ))}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold mb-2">
                          <Link to={`/posts/${post.slug}`} className="hover:text-primary">
                            {post.title}
                          </Link>
                        </h3>

                        {/* Excerpt */}
                        <p className="text-base-content/70 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                          <Link
                            to={`/profile/${post.author._id}`}
                            className="flex items-center gap-2 hover:text-primary"
                          >
                            <div className="avatar">
                              <div className="w-6 rounded-full">
                                <img
                                  src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${post.author.name}`}
                                  alt={post.author.name}
                                />
                              </div>
                            </div>
                            <span>{post.author.name}</span>
                          </Link>
                          
                          <span>{format(new Date(post.publishedAt || post.createdAt), 'MMM dd, yyyy')}</span>
                          
                          <span className="flex items-center gap-1">
                            <FiClock /> {post.readingTime} min
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <FiEye /> {post.views}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <FiHeart /> {post.likeCount || 0}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <FiMessageCircle /> {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                {[...Array(data.pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    className={`join-item btn ${data.pagination.page === i + 1 ? 'btn-active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
