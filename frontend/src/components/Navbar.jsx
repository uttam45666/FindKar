import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, ChevronDown, Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const { user, logout, listSessions } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState([]);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openLogoutModal = async () => {
    setShowUserMenu(false);
    setShowLogoutModal(true);
    setSessionsLoading(true);
    setSelectedSessionIds([]);
    try {
      const data = await listSessions();
      setSessions(data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const closeLogoutModal = () => {
    if (logoutLoading) return;
    setShowLogoutModal(false);
  };

  const handleLogoutMode = async (mode) => {
    if (mode === 'selected' && selectedSessionIds.length === 0) return;
    setLogoutLoading(true);
    try {
      await logout({ mode, sessionIds: selectedSessionIds });
      setShowLogoutModal(false);
      navigate('/login');
    } finally {
      setLogoutLoading(false);
    }
  };

  const toggleSessionSelection = (sessionId) => {
    setSelectedSessionIds((prev) => (
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    ));
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  const navLinks = user?.role === 'customer'
    ? [{ label: 'Find Services', to: '/services' }, { label: 'My Bookings', to: '/bookings' }]
    : user?.role === 'provider'
    ? [{ label: 'Dashboard', to: '/provider' }, { label: 'Bookings', to: '/provider/bookings' }, { label: 'Services', to: '/provider/services' }, { label: 'Earnings', to: '/provider/earnings' }]
    : [{ label: 'Dashboard', to: '/admin' }, { label: 'Providers', to: '/admin/providers' }, { label: 'Customers', to: '/admin/customers' }, { label: 'Bookings', to: '/admin/bookings' }, { label: 'SOS', to: '/admin/sos' }];

  return (
    <nav className="sticky top-0 z-50 bg-dark shadow-lg">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">F</span>
            </div>
            <span className="font-heading font-bold text-white text-xl">Findkar</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-white/70 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-medium transition-all">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-mono font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-all">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                  {user?.profileImage
                    ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary font-bold text-sm">{user?.fullName?.[0]}</span>
                  }
                </div>
                <span className="hidden md:block text-white text-sm font-medium max-w-24 truncate">{user?.fullName?.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-white/50 hidden md:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-medium text-dark text-sm truncate">{user?.fullName}</p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
                  </div>
                  <div className="py-1">
                    <Link to={user?.role === 'provider' ? '/provider/profile' : user?.role === 'admin' ? '/admin' : '/profile'} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-warm transition-colors">
                      <User size={15} className="text-muted" /> My Profile
                    </Link>
                    {user?.role === 'provider' && (
                      <Link to="/provider/setup" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark hover:bg-warm transition-colors">
                        <Settings size={15} className="text-muted" /> Shop Settings
                      </Link>
                    )}
                    <button onClick={openLogoutModal} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white/70 hover:text-white">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-white/10 animate-fade-in">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block text-white/70 hover:text-white px-3 py-2.5 text-sm font-medium">
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notification panel */}
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeLogoutModal}>
          <div className="w-full max-w-xl bg-card rounded-2xl border border-border shadow-card-hover" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-heading font-semibold text-dark text-lg">Manage active logins</h3>
              <p className="text-sm text-muted mt-1">
                You are logged in on {sessions.length} device(s). Choose what to log out.
              </p>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-6 text-muted text-sm gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading sessions...
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border overflow-hidden">
                    {sessions.map((session) => (
                      <label key={session.sessionId} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0">
                        {!session.isCurrent ? (
                          <input
                            type="checkbox"
                            checked={selectedSessionIds.includes(session.sessionId)}
                            onChange={() => toggleSessionSelection(session.sessionId)}
                            className="mt-1"
                          />
                        ) : <span className="w-4 mt-1" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark truncate">
                            {session.deviceInfo || 'Unknown device'} {session.isCurrent ? '(Current)' : ''}
                          </p>
                          <p className="text-xs text-muted mt-0.5">IP: {session.ipAddress || '-'}</p>
                          <p className="text-xs text-muted mt-0.5">
                            Active {formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button
                      disabled={logoutLoading}
                      onClick={() => handleLogoutMode('current')}
                      className="btn-secondary text-sm"
                    >
                      Logout current
                    </button>
                    <button
                      disabled={logoutLoading || selectedSessionIds.length === 0}
                      onClick={() => handleLogoutMode('selected')}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      Logout selected ({selectedSessionIds.length})
                    </button>
                    <button
                      disabled={logoutLoading || sessions.length === 0}
                      onClick={() => handleLogoutMode('all')}
                      className="btn-primary text-sm"
                    >
                      Logout all ({sessions.length})
                    </button>
                  </div>

                  {otherSessions.length === 0 && sessions.length > 0 && (
                    <p className="text-xs text-muted text-center">No other active device sessions found.</p>
                  )}
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t border-border flex justify-end">
              <button onClick={closeLogoutModal} className="text-sm text-muted hover:text-dark" disabled={logoutLoading}>Close</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
