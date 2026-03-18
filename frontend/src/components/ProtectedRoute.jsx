import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuth, user } = useAuth();
  const location = useLocation();

  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user?.role)) {
    const redirect = user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/';
    return <Navigate to={redirect} replace />;
  }
  return children;
};

export default ProtectedRoute;
