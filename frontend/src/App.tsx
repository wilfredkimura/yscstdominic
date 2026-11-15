import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { EventsPage } from './pages/EventsPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { GalleryPage } from './pages/GalleryPage';
import { AboutPage } from './pages/AboutPage';
import { GetInvolvedPage } from './pages/GetInvolvedPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminBlogPage } from './pages/admin/AdminBlogPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLeadersPage } from './pages/admin/AdminLeadersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { Analytics } from '@vercel/analytics/react';
import api from './services/api';

function AppRoutes() {
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
      </Route>

      {/* Admin Login (Public) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

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
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
        <Analytics />
      </Router>
    </AuthProvider>
  );
}