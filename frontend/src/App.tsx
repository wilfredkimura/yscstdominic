import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { EventsPage } from './pages/EventsPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { GetInvolvedPage } from './pages/GetInvolvedPage';
import { AuthPage } from './pages/AuthPage';
import { PrayerWallPage } from './pages/PrayerWallPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminBlogPage } from './pages/admin/AdminBlogPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLeadersPage } from './pages/admin/AdminLeadersPage';
import { AdminResourcesPage } from './pages/admin/AdminResourcesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { useAuth } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import api from './services/api';

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Internal Page View Tracker
    api.post('/analytics/track', { path: location.pathname }).catch(console.error);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogPostPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="get-involved" element={<GetInvolvedPage />} />
        <Route path="prayer-wall" element={<PrayerWallPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route
          path="login"
          element={user ? <Navigate to="/admin" replace /> : <AuthPage />}
        />
        <Route
          path="signup"
          element={user ? <Navigate to="/admin" replace /> : <AuthPage />}
        />
        <Route
          path="register"
          element={user ? <Navigate to="/admin" replace /> : <Navigate to="/signup" replace />}
        />
      </Route>

      {/* Admin Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="blogs" element={<AdminBlogPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="leaders" element={<AdminLeadersPage />} />
        <Route path="resources" element={<AdminResourcesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
      <Analytics />
    </Router>
  );
}