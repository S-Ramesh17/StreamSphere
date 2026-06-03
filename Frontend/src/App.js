import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public
import HomePage from './pages/public/HomePage';
import BrowsePage from './pages/public/BrowsePage';
import CategoriesPage from './pages/public/CategoriesPage';
import SearchPage from './pages/public/SearchPage';
import PricingPage from './pages/public/PricingPage';

// Video
import VideoDetailPage from './pages/video/VideoDetailPage';
import VideoPlayerPage from './pages/video/VideoPlayerPage';

// Live
import LiveStreamsPage from './pages/live/LiveStreamsPage';
import StreamDetailPage from './pages/live/StreamDetailPage';

// Subscriber
import DashboardPage from './pages/subscriber/DashboardPage';
import ProfilePage from './pages/subscriber/ProfilePage';
import WatchHistoryPage from './pages/subscriber/WatchHistoryPage';
import ContinueWatchingPage from './pages/subscriber/ContinueWatchingPage';
import SubscriptionPage from './pages/subscriber/SubscriptionPage';
import SettingsPage from './pages/subscriber/SettingsPage';

// Creator
import CreatorDashboardPage from './pages/creator/CreatorDashboardPage';
import UploadVideoPage from './pages/creator/UploadVideoPage';
import ManageVideosPage from './pages/creator/ManageVideosPage';
import ManageStreamsPage from './pages/creator/ManageStreamsPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AdminVideosPage from './pages/admin/AdminVideosPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/videos/:id" element={<VideoDetailPage />} />
      <Route path="/watch/:id" element={<VideoPlayerPage />} />
      <Route path="/live" element={<LiveStreamsPage />} />
      <Route path="/live/:id" element={<StreamDetailPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><WatchHistoryPage /></ProtectedRoute>} />
      <Route path="/continue" element={<ProtectedRoute><ContinueWatchingPage /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="/creator" element={<ProtectedRoute roles={['creator','admin']}><CreatorDashboardPage /></ProtectedRoute>} />
      <Route path="/creator/upload" element={<ProtectedRoute roles={['creator','admin']}><UploadVideoPage /></ProtectedRoute>} />
      <Route path="/creator/videos" element={<ProtectedRoute roles={['creator','admin']}><ManageVideosPage /></ProtectedRoute>} />
      <Route path="/creator/streams" element={<ProtectedRoute roles={['creator','admin']}><ManageStreamsPage /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsersPage /></ProtectedRoute>} />
      <Route path="/admin/videos" element={<ProtectedRoute roles={['admin']}><AdminVideosPage /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategoriesPage /></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute roles={['admin']}><AdminSubscriptionsPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><AnalyticsPage /></ProtectedRoute>} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
