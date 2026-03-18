import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Star, TrendingUp, Users, ToggleLeft, ToggleRight, AlertCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Spinner, StatusBadge } from '../../components/UI.jsx';
import { format } from 'date-fns';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchData = async () => {
    try {
      const [provRes, activeRes, bookRes] = await Promise.all([
        api.get('/providers/me/profile'),
        api.get('/bookings/active'),
        api.get('/bookings/provider?limit=5'),
      ]);
      setProvider(provRes.data.provider);
      setActiveBooking(activeRes.data.booking);
      setRecentBookings(bookRes.data.bookings || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data } = await api.patch('/providers/me/availability');
      setProvider(p => ({ ...p, availability: data.availability }));
      toast.success(data.availability ? 'You are now online!' : 'You are now offline');
    } catch { toast.error('Failed to update'); }
    finally { setToggling(false); }
  };

  if (loading) return <Spinner />;
  if (!provider) return (
    <div className="min-h-screen py-8 page-container max-w-2xl">
      <div className="card p-10 text-center">
        <AlertCircle size={40} className="text-muted mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-dark mb-2">Complete Your Profile</h2>
        <p className="text-muted text-sm mb-6">Set up your shop profile to start receiving bookings.</p>
        <Link to="/provider/setup" className="btn-primary">Set Up Profile →</Link>
      </div>
    </div>
  );

  const stats = [
    { label: 'Completed Jobs', value: provider.completedJobs, icon: Briefcase, color: 'text-primary' },
    { label: 'Trust Score', value: `${provider.trustScore}%`, icon: Star, color: 'text-gold' },
    { label: 'Total Earnings', value: `₹${provider.totalEarnings?.toLocaleString()}`, icon: TrendingUp, color: 'text-success' },
    { label: 'Neighbor Shares', value: provider.neighborShares, icon: Users, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
            <p className="text-muted text-sm">{provider.shopName} · {provider.primaryCategory?.replace('_', ' ')}</p>
          </div>
          <button onClick={toggleAvailability} disabled={toggling} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium ${provider.availability ? 'border-success bg-green-50 text-success' : 'border-border bg-white text-muted'}`}>
            {provider.availability ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {toggling ? '...' : provider.availability ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Profile incomplete warning */}
        {!provider.isProfileComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Profile incomplete</p>
                <p className="text-xs text-yellow-600">Add at least one service to activate your profile and start receiving bookings.</p>
              </div>
            </div>
            <Link to="/provider/setup" className="btn-primary text-sm px-4 py-2">Complete →</Link>
          </div>
        )}

        {!provider.isApproved && provider.isProfileComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={18} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-700">Profile under admin review</p>
              <p className="text-xs text-blue-600">Your profile has been submitted for admin approval. You'll be notified once it's approved.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted">{s.label}</span>
                <s.icon size={16} className={s.color} />
              </div>
              <div className="font-mono font-bold text-2xl text-dark">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active booking */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-dark">Active Job</h2>
              <Link to="/provider/bookings" className="text-sm text-primary hover:underline flex items-center gap-1">
                All bookings <ChevronRight size={14} />
              </Link>
            </div>
            {activeBooking ? (
              <Link to={`/provider/bookings/${activeBooking._id}`} className="block bg-primary-light border border-primary/20 rounded-xl p-4 hover:border-primary transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-dark text-sm">{activeBooking.serviceType}</p>
                  <StatusBadge status={activeBooking.status} />
                </div>
                <p className="text-xs text-muted">{activeBooking.customerId?.fullName} · {activeBooking.city}</p>
                <p className="text-xs text-muted mt-1">{format(new Date(activeBooking.scheduledAt), 'dd MMM, h:mm a')}</p>
              </Link>
            ) : (
              <div className="text-center py-8 text-muted text-sm">No active jobs right now</div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-dark mb-4">Recent Bookings</h2>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm">No bookings yet</div>
            ) : (
              <div className="space-y-2">
                {recentBookings.map(b => (
                  <Link to={`/provider/bookings/${b._id}`} key={b._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-warm transition-colors">
                    <div>
                      <p className="text-sm font-medium text-dark">{b.serviceType}</p>
                      <p className="text-xs text-muted">{b.customerId?.fullName} · {format(new Date(b.scheduledAt), 'dd MMM')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'View Bookings', to: '/provider/bookings', color: 'bg-primary/10 text-primary' },
            { label: 'Manage Services', to: '/provider/services', color: 'bg-blue-50 text-blue-600' },
            { label: 'My Earnings', to: '/provider/earnings', color: 'bg-green-50 text-success' },
            { label: 'Edit Profile', to: '/provider/setup', color: 'bg-warm text-muted' },
          ].map(a => (
            <Link key={a.label} to={a.to} className={`card p-4 text-center text-sm font-medium hover:shadow-card-hover transition-all hover:-translate-y-0.5 ${a.color}`}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
