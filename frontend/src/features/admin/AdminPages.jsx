import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, TrendingUp, AlertTriangle, CheckCircle, XCircle, Shield, Search, Eye, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { Spinner, EmptyState, StatusBadge, Pagination } from '../../components/UI.jsx';
import { format, formatDistanceToNow } from 'date-fns';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return null;

  const cards = [
    { label: 'Total Customers', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Providers', value: stats.totalProviders, icon: Shield, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Briefcase, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Platform Revenue', value: `₹${(stats.platformRevenue || 0).toFixed(0)}`, icon: TrendingUp, color: 'text-gold', bg: 'bg-yellow-50' },
    { label: 'Active Jobs', value: stats.activeBookings, icon: CheckCircle, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Pending Approval', value: stats.pendingApproval, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Active SOS', value: stats.activeSOS, icon: AlertTriangle, color: 'text-danger', bg: 'bg-red-50' },
    { label: 'Cancelled', value: stats.cancelledBookings, icon: XCircle, color: 'text-muted', bg: 'bg-warm' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="text-muted text-sm">Platform overview</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map(c => (
            <div key={c.label} className="card p-5">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
                <c.icon size={18} className={c.color} />
              </div>
              <div className="font-mono font-bold text-2xl text-dark">{c.value}</div>
              <div className="text-xs text-muted mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Recent bookings */}
        {stats.recentBookings?.length > 0 && (
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-dark mb-4">Recent Bookings</h2>
            <div className="space-y-2">
              {stats.recentBookings.map(b => (
                <div key={b._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-warm transition-colors">
                  <div>
                    <p className="text-sm font-medium text-dark">{b.serviceType}</p>
                    <p className="text-xs text-muted">{b.customerId?.fullName} → {b.providerId?.userId?.fullName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-xs text-muted">{formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState('');

  const fetch = async (pg = 1, st = status, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (st) params.set('status', st);
      if (q) params.set('search', q);
      const { data } = await api.get(`/admin/providers?${params}`);
      setProviders(data.providers || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(1, status, search); }, [status]);

  const approve = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await api.patch(`/admin/providers/${id}/approve`);
      toast.success('Provider approved!');
      fetch(page, status, search);
    } catch { toast.error('Failed'); }
    finally { setActionLoading(''); }
  };

  const block = async (id) => {
    const reason = window.prompt('Reason for blocking:');
    if (reason === null) return;
    setActionLoading(id + '_block');
    try {
      await api.patch(`/admin/providers/${id}/block`, { reason });
      toast.success('Provider blocked');
      fetch(page, status, search);
    } catch { toast.error('Failed'); }
    finally { setActionLoading(''); }
  };

  const unblock = async (id) => {
    setActionLoading(id + '_unblock');
    try {
      await api.patch(`/admin/providers/${id}/unblock`);
      toast.success('Provider unblocked');
      fetch(page, status, search);
    } catch { toast.error('Failed'); }
    finally { setActionLoading(''); }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Providers</h1>
            <p className="text-muted text-sm">{total} total</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex gap-2">
            {[{ v: 'pending', l: 'Pending' }, { v: 'approved', l: 'Approved' }, { v: 'blocked', l: 'Blocked' }, { v: '', l: 'All' }].map(f => (
              <button key={f.v} onClick={() => setStatus(f.v)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${status === f.v ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted hover:border-primary/50'}`}>{f.l}</button>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); fetch(1, status, search); }} className="flex gap-2 ml-auto">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input-field pl-9 py-2 text-sm w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn-secondary text-sm px-4 py-2">Search</button>
          </form>
        </div>

        {loading ? <Spinner /> : providers.length === 0 ? (
          <EmptyState title="No providers found" />
        ) : (
          <div className="space-y-3">
            {providers.map(p => (
              <div key={p._id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex-shrink-0">
                      {p.profileImage
                        ? <img src={p.profileImage} alt="" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-primary font-bold">{p.shopName?.[0]}</span>
                      }
                    </div>
                    <div>
                      <p className="font-medium text-dark">{p.shopName}</p>
                      <p className="text-xs text-muted capitalize">{p.primaryCategory?.replace('_', ' ')} · {p.shopCity}</p>
                      <p className="text-xs text-muted">{p.userId?.email} · {p.userId?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isBlocked && <span className="badge-danger">Blocked</span>}
                    {p.isApproved && !p.isBlocked && <span className="badge-verified">Approved</span>}
                    {!p.isApproved && !p.isBlocked && <span className="badge-pending">Pending</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted">Trust: <b>{p.trustScore}%</b></span>
                  <span className="text-xs text-muted">Jobs: <b>{p.completedJobs}</b></span>
                  <span className="text-xs text-muted">Joined: {format(new Date(p.createdAt), 'dd MMM yyyy')}</span>
                  <div className="flex gap-2 ml-auto">
                    {!p.isApproved && !p.isBlocked && (
                      <button onClick={() => approve(p._id)} disabled={!!actionLoading} className="btn-primary text-xs px-3 py-1.5 rounded-lg">
                        {actionLoading === p._id + '_approve' ? '...' : '✓ Approve'}
                      </button>
                    )}
                    {!p.isBlocked && (
                      <button onClick={() => block(p._id)} disabled={!!actionLoading} className="btn-danger text-xs px-3 py-1.5 rounded-lg">
                        {actionLoading === p._id + '_block' ? '...' : 'Block'}
                      </button>
                    )}
                    {p.isBlocked && (
                      <button onClick={() => unblock(p._id)} disabled={!!actionLoading} className="btn-secondary text-xs px-3 py-1.5 rounded-lg text-success border-success">
                        {actionLoading === p._id + '_unblock' ? '...' : 'Unblock'}
                      </button>
                    )}
                  </div>
                </div>
                {p.blockedReason && <p className="text-xs text-danger mt-2 bg-red-50 rounded-lg px-3 py-1.5">Reason: {p.blockedReason}</p>}
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={p => fetch(p, status, search)} />
      </div>
    </div>
  );
};

export const AdminCustomerList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = async (pg = 1, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (q) params.set('search', q);
      const { data } = await api.get(`/admin/customers?${params}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const toggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/customers/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
      toast.success(data.user.isActive ? 'User activated' : 'User deactivated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Customers</h1>
            <p className="text-muted text-sm">{total} total</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); fetch(1, search); }} className="flex gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input-field pl-9 py-2 text-sm w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn-secondary text-sm px-4 py-2">Search</button>
          </form>
        </div>
        {loading ? <Spinner /> : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u._id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {u.fullName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-dark text-sm">{u.fullName}</p>
                    <p className="text-xs text-muted">{u.email} · {u.phone}</p>
                    <p className="text-xs text-muted">Joined {format(new Date(u.createdAt), 'dd MMM yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {u.isActive ? <span className="badge-verified">Active</span> : <span className="badge-danger">Inactive</span>}
                  <button onClick={() => toggle(u._id)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${u.isActive ? 'border-danger text-danger hover:bg-red-50' : 'border-success text-success hover:bg-green-50'}`}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={p => fetch(p, search)} />
      </div>
    </div>
  );
};

export const AdminSOSMonitor = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetch = async (pg = 1, st = status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (st) params.set('status', st);
      const { data } = await api.get(`/admin/sos?${params}`);
      setAlerts(data.alerts || []);
      setPages(data.pages || 1);
      setPage(pg);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(1, status); }, [status]);

  const resolve = async (id, newStatus) => {
    const notes = window.prompt(`Notes for ${newStatus}:`);
    if (notes === null) return;
    try {
      await api.patch(`/admin/sos/${id}/resolve`, { status: newStatus, notes });
      toast.success(`Alert marked as ${newStatus}`);
      fetch(page, status);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <AlertTriangle size={24} className="text-danger" /> SOS Monitor
            </h1>
            <p className="text-muted text-sm">Real-time emergency alerts</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[{ v: 'active', l: '🔴 Active' }, { v: 'resolved', l: '✅ Resolved' }, { v: 'false_alarm', l: '⚠️ False Alarm' }, { v: '', l: 'All' }].map(f => (
            <button key={f.v} onClick={() => setStatus(f.v)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${status === f.v ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted hover:border-primary/50'}`}>{f.l}</button>
          ))}
        </div>

        {loading ? <Spinner /> : alerts.length === 0 ? (
          <EmptyState title="No SOS alerts" message="All clear!" />
        ) : (
          <div className="space-y-4">
            {alerts.map(a => (
              <div key={a._id} className={`card p-5 border-2 ${a.status === 'active' ? 'border-danger/40 bg-red-50/30' : 'border-border'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-heading font-semibold text-dark">SOS Alert #{a._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-muted">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${a.status === 'active' ? 'bg-red-100 text-danger' : a.status === 'resolved' ? 'bg-green-100 text-success' : 'bg-yellow-100 text-yellow-700'}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-warm rounded-xl p-3">
                    <p className="text-xs text-muted mb-2 font-medium">CUSTOMER</p>
                    <p className="text-sm font-semibold text-dark">{a.customerId?.fullName}</p>
                    <p className="text-xs text-muted">{a.customerId?.phone}</p>
                    <p className="text-xs text-muted">{a.address}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <p className="text-xs text-danger mb-2 font-medium">PROVIDER (AUTO-BLOCKED)</p>
                    <p className="text-sm font-semibold text-dark">{a.providerId?.shopName || a.providerId?.userId?.fullName}</p>
                    <p className="text-xs text-muted">{a.providerId?.userId?.phone}</p>
                    <p className="text-xs text-muted capitalize">{a.providerId?.primaryCategory?.replace('_', ' ')}</p>
                  </div>
                </div>

                {a.adminNotes && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-blue-700"><strong>Admin notes:</strong> {a.adminNotes}</p>
                  </div>
                )}

                {a.status === 'active' && (
                  <div className="flex gap-3">
                    <button onClick={() => resolve(a._id, 'resolved')} className="btn-primary flex-1 text-sm py-2">✓ Mark Resolved</button>
                    <button onClick={() => resolve(a._id, 'false_alarm')} className="btn-secondary flex-1 text-sm py-2">⚠️ False Alarm</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={p => fetch(p, status)} />
      </div>
    </div>
  );
};

export const AdminBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = async (pg = 1, st = status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20 });
      if (st) params.set('status', st);
      const { data } = await api.get(`/admin/bookings?${params}`);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(1, status); }, [status]);

  return (
    <div className="min-h-screen py-8">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="section-title">All Bookings</h1>
          <p className="text-muted text-sm">{total} total</p>
        </div>
        <div className="flex gap-2 flex-wrap mb-6">
          {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-full text-xs font-medium border transition-all capitalize ${status === s ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted hover:border-primary/50'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        {loading ? <Spinner /> : (
          <div className="space-y-2">
            {bookings.map(b => (
              <div key={b._id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark">{b.serviceType}</p>
                  <p className="text-xs text-muted">{b.customerId?.fullName} → {b.providerId?.userId?.fullName}</p>
                  <p className="text-xs text-muted">{b.city} · {format(new Date(b.scheduledAt), 'dd MMM, h:mm a')}</p>
                </div>
                <div className="flex items-center gap-3">
                  {b.jobAmount && <span className="font-mono text-sm font-semibold text-dark">₹{b.jobAmount}</span>}
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={p => fetch(p, status)} />
      </div>
    </div>
  );
};
