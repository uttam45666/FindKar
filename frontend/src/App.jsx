import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Auth
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';

// Customer
import CustomerHome from './features/customer/CustomerHome.jsx';
import ServiceListingPage from './features/customer/ServiceListingPage.jsx';
import ProviderProfilePage from './features/customer/ProviderProfilePage.jsx';
import BookingTrackingPage from './features/customer/BookingTrackingPage.jsx';
import BookingHistoryPage from './features/customer/BookingHistoryPage.jsx';
import CustomerProfile from './features/customer/CustomerProfile.jsx';

// Provider
import ProviderDashboard from './features/provider/ProviderDashboard.jsx';
import { ProviderBookingList, ProviderBookingDetail } from './features/provider/ProviderBookingManager.jsx';
import { ProviderSetupPage, ProviderServicesPage, ProviderEarningsPage } from './features/provider/ProviderPages.jsx';

// Admin
import { AdminDashboard, AdminProviderList, AdminCustomerList, AdminSOSMonitor, AdminBookingList } from './features/admin/AdminPages.jsx';

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-warm">
    <Navbar />
    <main>{children}</main>
  </div>
);

const App = () => {
  const { isAuth, user } = useAuth();

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={isAuth ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/'} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuth ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />

      {/* Customer routes */}
      <Route path="/" element={
        <ProtectedRoute roles={['customer']}>
          <AppLayout><CustomerHome /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/services" element={
        <ProtectedRoute roles={['customer']}>
          <AppLayout><ServiceListingPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/provider/:id" element={
        <ProtectedRoute roles={['customer']}>
          <AppLayout><ProviderProfilePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute roles={['customer']}>
          <AppLayout><BookingHistoryPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/bookings/:id" element={
        <ProtectedRoute roles={['customer']}>
          <AppLayout><BookingTrackingPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute roles={['customer']}>
          <AppLayout><CustomerProfile /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Provider routes */}
      <Route path="/provider" element={
        <ProtectedRoute roles={['provider']}>
          <AppLayout><ProviderDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/provider/setup" element={
        <ProtectedRoute roles={['provider']}>
          <AppLayout><ProviderSetupPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/provider/bookings" element={
        <ProtectedRoute roles={['provider']}>
          <AppLayout><ProviderBookingList /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/provider/bookings/:id" element={
        <ProtectedRoute roles={['provider']}>
          <AppLayout><ProviderBookingDetail /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/provider/services" element={
        <ProtectedRoute roles={['provider']}>
          <AppLayout><ProviderServicesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/provider/earnings" element={
        <ProtectedRoute roles={['provider']}>
          <AppLayout><ProviderEarningsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/provider/profile" element={
        <ProtectedRoute roles={['provider']}>
          <AppLayout><ProviderSetupPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/providers" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminProviderList /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminCustomerList /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminBookingList /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/sos" element={
        <ProtectedRoute roles={['admin']}>
          <AppLayout><AdminSOSMonitor /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuth ? (user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/') : '/login'} replace />} />
    </Routes>
  );
};

export default App;
