import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Maker Pages
import MakerDashboard from './pages/maker/MakerDashboard';
import NewRequest from './pages/maker/NewRequest';
import MyRequests from './pages/maker/MyRequests';
import RequestDetail from './pages/maker/RequestDetail';

// Checker Pages
import CheckerDashboard from './pages/checker/CheckerDashboard';
import VerifyRequest from './pages/checker/VerifyRequest';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminRequests from './pages/admin/AdminRequests';
import AuditLogs from './pages/admin/AuditLogs';

const queryClient = new QueryClient();

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const dashboards = { maker: '/maker', checker: '/checker', admin: '/admin' };
  return <Navigate to={dashboards[user.role] || '/login'} replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1E3A5F',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { style: { background: '#059669' } },
                error: { style: { background: '#DC2626' } },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Maker Routes */}
              <Route path="/maker" element={
                <ProtectedRoute roles={['maker', 'admin']}>
                  <DashboardLayout><MakerDashboard /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/maker/new-request" element={
                <ProtectedRoute roles={['maker', 'admin']}>
                  <DashboardLayout><NewRequest /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/maker/requests" element={
                <ProtectedRoute roles={['maker', 'admin']}>
                  <DashboardLayout><MyRequests /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/maker/request/:id" element={
                <ProtectedRoute roles={['maker', 'checker', 'admin']}>
                  <DashboardLayout><RequestDetail /></DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Checker Routes */}
              <Route path="/checker" element={
                <ProtectedRoute roles={['checker', 'admin']}>
                  <DashboardLayout><CheckerDashboard /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/checker/pending" element={
                <ProtectedRoute roles={['checker', 'admin']}>
                  <DashboardLayout><CheckerDashboard /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/checker/verified" element={
                <ProtectedRoute roles={['checker', 'admin']}>
                  <DashboardLayout><CheckerDashboard /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/checker/rejected" element={
                <ProtectedRoute roles={['checker', 'admin']}>
                  <DashboardLayout><CheckerDashboard /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/checker/verify/:id" element={
                <ProtectedRoute roles={['checker', 'admin']}>
                  <DashboardLayout><VerifyRequest /></DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout><AdminDashboard /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout><UserManagement /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/requests" element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout><AdminRequests /></DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/audit-logs" element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout><AuditLogs /></DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
