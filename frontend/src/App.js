import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './i18n';

// Layout components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import PrivateRoute from './components/auth/PrivateRoute';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/home'));
const Login = React.lazy(() => import('./pages/login'));
const Register = React.lazy(() => import('./pages/register'));
const ForgotPassword = React.lazy(() => import('./pages/forgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/resetPassword'));
const Profile = React.lazy(() => import('./pages/profile'));
const EditProfile = React.lazy(() => import('./pages/editProfile'));
const CreatePost = React.lazy(() => import('./pages/createPost'));
const EditPost = React.lazy(() => import('./pages/editPost'));
const PostDetail = React.lazy(() => import('./pages/postDetail'));
const Dashboard = React.lazy(() => import('./pages/dashboard'));
const SearchResults = React.lazy(() => import('./pages/searchResults'));
const Settings = React.lazy(() => import('./pages/settings'));
const NotFound = React.lazy(() => import('./pages/notFound'));
const About = React.lazy(() => import('./pages/about'));
const Contact = React.lazy(() => import('./pages/contact'));
const PrivacyPolicy = React.lazy(() => import('./pages/privacy'));
const TermsAndConditions = React.lazy(() => import('./pages/terms'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {/*<Router>*/}
            <Layout>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/posts/:slug" element={<PostDetail />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  
                  {/* Private routes */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/edit-post/:id" element={<EditPost />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          {/*</Router>*/}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-base-200)',
                color: 'var(--color-base-content)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'white',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
