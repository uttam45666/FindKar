import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, RefreshCw, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { Spinner, EmptyState, StatusBadge, Pagination } from '../../components/UI.jsx';
import BookingModal from './BookingModal.jsx';
import { format } from 'date-fns';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [rebookProvider, setRebookProvider] = useState(null);
  const [rebookServiceType, setRebookServiceType] = useState('');
  const [rebookingId, setRebookingId] = useState('');

  const fetchBookings = async (pg = 1, st = status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 10 });
      if (st) params.set('status', st);
      const { data } = await api.get(`/bookings/my?${params}`);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(1, status); }, [status]);

  const openRebook = async (booking) => {
    const providerId = booking?.providerId?._id;
    if (!providerId) return;

    setRebookingId(booking._id);
    try {
      const { data } = await api.get(`/providers/${providerId}`);
      setRebookProvider(data.provider);
      setRebookServiceType(booking.serviceType || '');
    } catch {
      toast.error('Could not load provider details for re-book');
    } finally {
      setRebookingId('');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">My Bookings</h1>
            <p className="text-muted text-sm">{total} total bookings</p>
          </div>
          <Link to="/services" className="btn-primary text-sm px-4 py-2">+ New Booking</Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setStatus(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${status === f.value ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted hover:border-primary/50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : bookings.length === 0 ? (
          <EmptyState title="No bookings found" message="Book a service to get started."
            action={<Link to="/services" className="btn-primary">Find Services</Link>} />
        ) : (
          <>
            <div className="space-y-3">
              {bookings.map(b => {
                const provider = b.providerId;
                const canRebook = provider?._id && ['completed', 'cancelled'].includes(b.status);

                return (
                  <div
                    key={b._id}
                    onClick={() => navigate(`/bookings/${b._id}`)}
                    className="card block p-4 hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex-shrink-0">
                          {provider?.profileImage
                            ? <img src={provider.profileImage} alt="" className="w-full h-full object-cover" />
                            : <span className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">{provider?.shopName?.[0]}</span>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-dark text-sm">{b.serviceType}</p>
                          <p className="text-xs text-muted">{provider?.shopName || 'Provider'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={b.status} />
                        <ChevronRight size={16} className="text-muted" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {format(new Date(b.scheduledAt), 'dd MMM, h:mm a')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {b.city}
                      </span>
                      {b.jobAmount && (
                        <span className="ml-auto font-mono font-semibold text-dark">₹{b.jobAmount}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => navigate(`/provider/${provider?._id}`)}
                        disabled={!provider?._id}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                      >
                        <Store size={12} /> View Provider
                      </button>
                      <button
                        type="button"
                        onClick={() => openRebook(b)}
                        disabled={!canRebook || rebookingId === b._id}
                        className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={rebookingId === b._id ? 'animate-spin' : ''} /> Re-book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={page} pages={pages} onPage={(p) => fetchBookings(p, status)} />
          </>
        )}
      </div>

      {rebookProvider && (
        <BookingModal
          provider={rebookProvider}
          initialServiceType={rebookServiceType}
          onClose={() => {
            setRebookProvider(null);
            setRebookServiceType('');
          }}
        />
      )}
    </div>
  );
};

export default BookingHistoryPage;
