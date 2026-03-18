import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Phone, MapPin, Calendar, CheckCircle, DollarSign, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import { Spinner, EmptyState, StatusBadge, Pagination, ErrorAlert } from '../../components/UI.jsx';
import { format } from 'date-fns';

const FILTERS = ['', 'pending', 'confirmed', 'departed', 'arrived', 'in_progress', 'completed', 'cancelled'];

export const ProviderBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = async (pg = 1, st = status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 10 });
      if (st) params.set('status', st);
      const { data } = await api.get(`/bookings/provider?${params}`);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(1, status); }, [status]);

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Bookings</h1>
            <p className="text-muted text-sm">{total} total</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setStatus(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${status === f ? 'bg-primary text-white border-primary' : 'bg-white border-border text-muted hover:border-primary/50'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>
        {loading ? <Spinner /> : bookings.length === 0 ? (
          <EmptyState title="No bookings" message="New bookings will appear here." />
        ) : (
          <>
            <div className="space-y-3">
              {bookings.map(b => (
                <Link to={`/provider/bookings/${b._id}`} key={b._id}
                  className="card block p-4 hover:shadow-card-hover transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10 flex-shrink-0">
                        {b.customerId?.profileImage
                          ? <img src={b.customerId.profileImage} alt="" className="w-full h-full object-cover" />
                          : <span className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">{b.customerId?.fullName?.[0]}</span>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-dark text-sm">{b.serviceType}</p>
                        <p className="text-xs text-muted">{b.customerId?.fullName} · {b.city}</p>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {format(new Date(b.scheduledAt), 'dd MMM, h:mm a')}</span>
                    {b.jobAmount && <span className="ml-auto font-mono font-semibold text-dark">₹{b.jobAmount}</span>}
                  </div>
                </Link>
              ))}
            </div>
            <Pagination page={page} pages={pages} onPage={p => fetch(p, status)} />
          </>
        )}
      </div>
    </div>
  );
};

export const ProviderBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [jobAmount, setJobAmount] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [error, setError] = useState('');

  const fetchBooking = useCallback(async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      setBooking(data.booking);
    } catch { navigate('/provider/bookings'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchBooking(); const iv = setInterval(fetchBooking, 15000); return () => clearInterval(iv); }, [fetchBooking]);

  const updateStatus = async (status, extra = {}) => {
    setStatusLoading(true); setError('');
    try {
      await api.patch(`/bookings/${id}/status`, { status, ...extra });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      fetchBooking();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setStatusLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setOtpError('');
    try {
      await api.post(`/bookings/${id}/verify-otp`, { otp: otpInput });
      toast.success('OTP verified! Work started.');
      fetchBooking();
    } catch (err) { setOtpError(err.response?.data?.message || 'Invalid OTP'); }
  };

  const handleComplete = async () => {
    if (!jobAmount || isNaN(jobAmount) || Number(jobAmount) <= 0) { setError('Enter valid job amount'); return; }
    await updateStatus('completed', { jobAmount: Number(jobAmount) });
    setShowComplete(false);
  };

  if (loading) return <Spinner />;
  if (!booking) return null;

  const customer = booking.customerId;
  const nextActions = {
    pending: [{ label: 'Confirm Booking', status: 'confirmed', style: 'btn-primary' }, { label: 'Decline', status: 'cancelled', style: 'btn-danger', requireReason: true }],
    confirmed: [{ label: 'Mark Departed', status: 'departed', style: 'btn-primary' }, { label: 'Cancel', status: 'cancelled', style: 'btn-danger', requireReason: true }],
    departed: [{ label: 'Mark Arrived', status: 'arrived', style: 'btn-primary' }],
    arrived: null, // OTP flow
    in_progress: [{ label: 'Mark Complete & Enter Amount', style: 'btn-primary', action: () => setShowComplete(true) }],
  }[booking.status] || [];

  return (
    <div className="min-h-screen py-8">
      <div className="page-container max-w-2xl">
        <button onClick={() => navigate('/provider/bookings')} className="flex items-center gap-2 text-muted hover:text-dark text-sm mb-6">
          <ChevronLeft size={16} /> All Bookings
        </button>

        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-heading text-xl font-bold text-dark">{booking.serviceType}</h1>
              <p className="text-sm text-muted">#{booking._id.slice(-6).toUpperCase()}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

          {/* Customer details */}
          <div className="bg-warm rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary/10">
                {customer?.profileImage
                  ? <img src={customer.profileImage} alt="" className="w-full h-full object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-primary font-bold">{customer?.fullName?.[0]}</span>
                }
              </div>
              <div>
                <p className="font-medium text-dark text-sm">{customer?.fullName}</p>
                <a href={`tel:${customer?.phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Phone size={10} /> {customer?.phone}
                </a>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted">
              <p className="flex items-center gap-1"><MapPin size={11} /> {booking.address}, {booking.city}, {booking.state}</p>
              <p className="flex items-center gap-1"><Calendar size={11} /> {format(new Date(booking.scheduledAt), 'dd MMM yyyy, h:mm a')}</p>
              {booking.problemDescription && <p className="mt-2 text-dark/70">{booking.problemDescription}</p>}
            </div>
          </div>

          {/* OTP entry (when arrived) */}
          {booking.status === 'arrived' && !booking.otpVerified && (
            <div className="bg-primary-light border border-primary/30 rounded-xl p-4 mb-4">
              <h3 className="font-heading font-semibold text-primary mb-2 flex items-center gap-2">
                <Key size={16} /> Enter Customer OTP
              </h3>
              <p className="text-xs text-primary/70 mb-3">Ask the customer for the 4-digit OTP shown on their phone.</p>
              {otpError && <div className="mb-3"><ErrorAlert message={otpError} /></div>}
              <form onSubmit={handleVerifyOTP} className="flex gap-2">
                <input type="text" inputMode="numeric" maxLength={4} placeholder="0000"
                  value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="input-field text-center font-mono font-bold text-xl tracking-widest flex-1"
                />
                <button type="submit" disabled={otpInput.length < 4} className="btn-primary px-5">Verify</button>
              </form>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            {nextActions.map(action => (
              <button key={action.label} disabled={statusLoading}
                onClick={() => {
                  if (action.action) { action.action(); return; }
                  if (action.requireReason) { setShowCancel(true); return; }
                  updateStatus(action.status);
                }}
                className={`${action.style} flex-1`}>
                {statusLoading ? '...' : action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {booking.statusHistory?.length > 0 && (
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-dark mb-4">Timeline</h2>
            <div className="space-y-3">
              {[...booking.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <div>
                    <p className="text-sm font-medium text-dark capitalize">{h.status.replace('_', ' ')}</p>
                    <p className="text-xs text-muted">{format(new Date(h.timestamp), 'dd MMM, h:mm a')} — {h.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-dark/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-heading font-semibold text-dark mb-2">Cancel Booking</h3>
            <p className="text-xs text-muted mb-1">Note: Cancellation may affect your trust score.</p>
            <textarea className="input-field resize-none mt-3 mb-4" rows={3} placeholder="Reason for cancellation..."
              value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="btn-secondary flex-1">Keep</button>
              <button onClick={() => { setShowCancel(false); updateStatus('cancelled', { cancelReason }); }} className="btn-danger flex-1">Cancel Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* Complete + amount modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-dark/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="font-heading font-semibold text-dark mb-2 flex items-center gap-2">
              <DollarSign size={18} className="text-success" /> Enter Job Amount
            </h3>
            <p className="text-sm text-muted mb-4">Enter the final amount charged for this job. Platform fee (5%) will be calculated automatically.</p>
            {error && <div className="mb-3"><ErrorAlert message={error} /></div>}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">₹</span>
              <input type="number" min="1" className="input-field pl-8" placeholder="0"
                value={jobAmount} onChange={e => setJobAmount(e.target.value)} autoFocus />
            </div>
            {jobAmount && Number(jobAmount) > 0 && (
              <div className="bg-warm rounded-xl p-3 mb-4 text-sm">
                <div className="flex justify-between text-muted"><span>Job amount</span><span className="font-mono">₹{jobAmount}</span></div>
                <div className="flex justify-between text-muted"><span>Platform fee (5%)</span><span className="font-mono text-danger">-₹{(Number(jobAmount) * 0.05).toFixed(0)}</span></div>
                <div className="flex justify-between font-semibold text-dark border-t border-border mt-2 pt-2">
                  <span>You receive</span><span className="font-mono text-success">₹{(Number(jobAmount) * 0.95).toFixed(0)}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowComplete(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleComplete} disabled={statusLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <CheckCircle size={14} /> {statusLoading ? '...' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
