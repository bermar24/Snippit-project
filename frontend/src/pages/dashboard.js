import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import {
  FiFileText,
  FiEye,
  FiHeart,
  FiMessageCircle,
  FiTrendingUp,
  FiEdit3,
  FiPlus,
  FiBarChart2
} from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, trend }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card bg-base-200 shadow-xl"
    >
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="text-2xl text-primary" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-success' : 'text-error'}`}>
              <FiTrendingUp className={trend < 0 ? 'rotate-180' : ''} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold mt-4">{value}</h3>
        <p className="text-base-content/60">{label}</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user._id, timeRange],
    queryFn: async () => {
      const response = await axios.get(`/users/${user._id}/stats?range=${timeRange}`);
      return response.data.data;
    }
  });

  // Fetch user posts
  const { data: postsData } = useQuery({
    queryKey: ['user-posts', user._id, activeTab],
    queryFn: async () => {
      const params = activeTab === 'drafts' ? '?status=draft' : '';
      const response = await axios.get(`/posts/user/${user._id}${params}`);
      return response.data;
    }
  });

  if (isLoading) return <LoadingSpinner />;

  // Mock data for charts (in real app, this would come from the API)
  const viewsData = [
    { date: 'Mon', views: 120 },
    { date: 'Tue', views: 150 },
    { date: 'Wed', views: 180 },
    { date: 'Thu', views: 140 },
    { date: 'Fri', views: 200 },
    { date: 'Sat', views: 160 },
    { date: 'Sun', views: 190 }
  ];

  const categoryData = [
    { name: 'Technology', value: 35, color: '#3B82F6' },
    { name: 'Travel', value: 25, color: '#8B5CF6' },
    { name: 'Food', value: 20, color: '#F59E0B' },
    { name: 'Lifestyle', value: 15, color: '#10B981' },
    { name: 'Other', value: 5, color: '#6B7280' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-base-content/60 mt-1">
            Welcome back, {user.name}!
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last year</option>
          </select>
          
          <Link to="/create-post" className="btn btn-primary btn-sm">
            <FiPlus />
            {t('nav.createPost')}
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiFileText}
          label={t('dashboard.totalPosts')}
          value={stats?.totalPosts || 0}
          trend={12}
        />
        <StatCard
          icon={FiEye}
          label={t('dashboard.totalViews')}
          value={stats?.totalViews || 0}
          trend={8}
        />
        <StatCard
          icon={FiHeart}
          label={t('dashboard.totalLikes')}
          value={stats?.totalLikes || 0}
          trend={-3}
        />
        <StatCard
          icon={FiMessageCircle}
          label={t('dashboard.totalComments')}
          value={stats?.totalComments || 0}
          trend={15}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <FiBarChart2 />
              {t('dashboard.viewsOverTime')}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" />
                  <XAxis dataKey="date" stroke="var(--color-base-content)" />
                  <YAxis stroke="var(--color-base-content)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-base-200)',
                      border: '1px solid var(--color-base-300)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <h3 className="card-title">Post Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Posts Section */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t('dashboard.recentPosts')}
            </button>
            <button
              className={`tab ${activeTab === 'popular' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              {t('dashboard.popularPosts')}
            </button>
            <button
              className={`tab ${activeTab === 'drafts' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('drafts')}
            >
              {t('dashboard.drafts')}
            </button>
          </div>

          {/* Posts Table */}
          {postsData?.data?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/60 mb-4">
                {activeTab === 'drafts' ? 'No drafts found' : t('post.noPostsFound')}
              </p>
              <Link to="/create-post" className="btn btn-primary btn-sm">
                <FiEdit3 />
                {t('post.createYourFirst')}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('post.title')}</th>
                    <th>{t('post.status')}</th>
                    <th>{t('post.views')}</th>
                    <th>{t('post.likes')}</th>
                    <th>{t('comment.title')}</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postsData?.data?.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <Link
                          to={`/posts/${post.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${post.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                          {t(`post.${post.status}`)}
                        </span>
                      </td>
                      <td>{post.views}</td>
                      <td>{post.likeCount || 0}</td>
                      <td>{post.comments?.length || 0}</td>
                      <td>{format(new Date(post.createdAt), 'MMM dd')}</td>
                      <td>
                        <Link
                          to={`/edit-post/${post._id}`}
                          className="btn btn-ghost btn-xs"
                        >
                          <FiEdit3 />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
