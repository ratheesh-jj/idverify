import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FullPageLoader } from '../common';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboards = {
      maker: '/maker',
      checker: '/checker',
      admin: '/admin',
    };
    return <Navigate to={dashboards[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
